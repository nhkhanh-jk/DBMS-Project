from datetime import datetime

from bson import ObjectId

from repositories.base_repository import BaseRepository


class ShowtimeRepository:
    def __init__(self):
        self.showtimes = BaseRepository("showtimes")
        self.cinemas = BaseRepository("cinemas")

    def _get_populated_pipeline(self, match_query: dict) -> list[dict]:
        pipeline = [
            {"$match": match_query},
            {
                "$lookup": {
                    "from": "movies",
                    "localField": "movieId",
                    "foreignField": "_id",
                    "as": "movie_info",
                }
            },
            {"$unwind": {"path": "$movie_info", "preserveNullAndEmptyArrays": True}},
            {
                "$lookup": {
                    "from": "cinemas",
                    "localField": "cinemaId",
                    "foreignField": "_id",
                    "as": "cinema_info",
                }
            },
            {"$unwind": {"path": "$cinema_info", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "movieTitle": "$movie_info.title",
                    "cinemaName": "$cinema_info.name",
                    "matchedRoom": {
                        "$filter": {
                            "input": "$cinema_info.rooms",
                            "as": "room",
                            "cond": {"$eq": ["$$room._id", "$roomId"]},
                        }
                    },
                }
            },
            {
                "$addFields": {
                    "roomName": {"$arrayElemAt": ["$matchedRoom.name", 0]}
                }
            },
            {"$project": {"movie_info": 0, "cinema_info": 0, "matchedRoom": 0}},
        ]
        return pipeline

    def list_showtimes(
        self,
        movie_id: ObjectId | None = None,
        cinema_id: ObjectId | None = None,
        room_id: ObjectId | None = None,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
    ) -> list[dict]:
        query: dict = {}
        if movie_id:
            query["movieId"] = movie_id
        if cinema_id:
            query["cinemaId"] = cinema_id
        if room_id:
            query["roomId"] = room_id
        if start_time or end_time:
            time_query: dict = {}
            if start_time:
                time_query["$gte"] = start_time
            if end_time:
                time_query["$lt"] = end_time
            query["startTime"] = time_query

        pipeline = self._get_populated_pipeline(query)
        pipeline.append({"$sort": {"startTime": 1}})
        return list(self.showtimes.collection.aggregate(pipeline))

    def get_showtime(self, showtime_id: ObjectId) -> dict | None:
        pipeline = self._get_populated_pipeline({"_id": showtime_id})
        results = list(self.showtimes.collection.aggregate(pipeline))
        return results[0] if results else None

    def create_showtime(self, showtime_doc: dict):
        return self.showtimes.insert_one(showtime_doc)

    def update_showtime(self, showtime_id: ObjectId, showtime_doc: dict) -> int:
        return self.showtimes.update_one({"_id": showtime_id}, {"$set": showtime_doc})

    def delete_showtime(self, showtime_id: ObjectId) -> int:
        result = self.showtimes.collection.delete_one({"_id": showtime_id})
        return result.deleted_count

    def get_room(self, cinema_id: ObjectId, room_id: ObjectId) -> dict | None:
        cinema = self.cinemas.find_one({"_id": cinema_id, "rooms._id": room_id}, {"rooms.$": 1})
        if not cinema or not cinema.get("rooms"):
            return None
        return cinema["rooms"][0]

    def find_room_by_identifier(self, room_identifier: str) -> tuple[ObjectId, ObjectId] | None:
        # Supports either room ObjectId string or room name (legacy FE payload).
        if ObjectId.is_valid(room_identifier):
            room_obj_id = ObjectId(room_identifier)
            cinema = self.cinemas.find_one({"rooms._id": room_obj_id}, {"_id": 1, "rooms.$": 1})
            if cinema and cinema.get("rooms"):
                return cinema["_id"], cinema["rooms"][0]["_id"]

        cinema = self.cinemas.find_one({"rooms.name": room_identifier}, {"_id": 1, "rooms.$": 1})
        if cinema and cinema.get("rooms"):
            return cinema["_id"], cinema["rooms"][0]["_id"]
        return None

    def has_conflict(
        self,
        room_id: ObjectId,
        start_time: datetime,
        end_time: datetime,
        exclude_showtime_id: ObjectId | None = None,
    ) -> bool:
        query = {
            "roomId": room_id,
            "startTime": {"$lt": end_time},
            "endTime": {"$gt": start_time},
        }
        if exclude_showtime_id:
            query["_id"] = {"$ne": exclude_showtime_id}
        return self.showtimes.find_one(query) is not None

    def mark_finished_showtimes(self, now_time: datetime) -> int:
        result = self.showtimes.collection.update_many(
            {
                "endTime": {"$lte": now_time},
                "status": {"$ne": "DA_CHIEU"},
            },
            {"$set": {"status": "DA_CHIEU"}},
        )
        return result.modified_count

    def add_booked_seats(self, showtime_id: ObjectId, seat_numbers: list[str]) -> int:
        result = self.showtimes.collection.update_one(
            {"_id": showtime_id},
            {"$addToSet": {"bookedSeats": {"$each": seat_numbers}}},
        )
        return result.modified_count
