from bson import ObjectId

from repositories.base_repository import BaseRepository


class SeatRepository:
    def __init__(self):
        self.cinemas = BaseRepository("cinemas")

    def get_room(self, cinema_id: ObjectId, room_id: ObjectId) -> dict | None:
        cinema = self.cinemas.find_one({"_id": cinema_id, "rooms._id": room_id}, {"rooms.$": 1})
        if not cinema or not cinema.get("rooms"):
            return None
        return cinema["rooms"][0]
