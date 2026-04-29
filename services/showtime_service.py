import json
from datetime import UTC, datetime, timedelta

from flask import current_app

from cache.redis_client import get_redis
from repositories.movie_repository import MovieRepository
from repositories.showtime_repository import ShowtimeRepository
from utils.datetime_utils import now_utc, parse_iso_datetime
from utils.dto_mappers import to_showtime_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_int, validate_string


class ShowtimeService:
    CACHE_KEY = "showtimes:list"

    def __init__(self):
        self.showtime_repo = ShowtimeRepository()
        self.movie_repo = MovieRepository()

    def list_showtimes(
        self,
        movie_id: str | None = None,
        cinema_id: str | None = None,
        room_id: str | None = None,
        date_value: str | None = None,
    ) -> list[dict]:
        if not movie_id and not cinema_id and not room_id and not date_value:
            cached = get_redis().get(self.CACHE_KEY)
            if cached:
                return json.loads(cached)

        movie_obj_id = parse_object_id(movie_id, "movieId") if movie_id else None
        cinema_obj_id = parse_object_id(cinema_id, "cinemaId") if cinema_id else None
        room_obj_id = parse_object_id(room_id, "roomId") if room_id else None

        start_time = None
        end_time = None
        if date_value:
            try:
                date_obj = datetime.fromisoformat(date_value).date()
            except ValueError as exc:
                raise ApiError("date must be in YYYY-MM-DD format", 400) from exc
            start_time = datetime.combine(date_obj, datetime.min.time(), tzinfo=UTC)
            end_time = start_time + timedelta(days=1)

        showtimes = self.showtime_repo.list_showtimes(
            movie_id=movie_obj_id,
            cinema_id=cinema_obj_id,
            room_id=room_obj_id,
            start_time=start_time,
            end_time=end_time,
        )
        dto_list = [to_showtime_dto(showtime) for showtime in showtimes]
        if not movie_id and not cinema_id and not room_id and not date_value:
            get_redis().setex(self.CACHE_KEY, current_app.config["CACHE_TTL_SECONDS"], json.dumps(dto_list))
        return dto_list

    def get_showtime(self, showtime_id: str) -> dict:
        showtime = self.showtime_repo.get_showtime(parse_object_id(showtime_id, "showtimeId"))
        if not showtime:
            raise ApiError("Showtime not found", 404)
        return to_showtime_dto(showtime)

    def create_showtime(self, payload: dict) -> dict:
        # Frontend compatibility: supports legacy keys MaPhim/MaPhong/ThoiGianBatDau/ThoiGianKetThuc/TrangThai.
        movie_id_raw = payload.get("movieId", payload.get("MaPhim"))
        cinema_id_raw = payload.get("cinemaId")
        room_id_raw = payload.get("roomId", payload.get("MaPhong"))
        start_time_raw = payload.get("startTime", payload.get("ThoiGianBatDau"))
        end_time_raw = payload.get("endTime", payload.get("ThoiGianKetThuc"))
        status = payload.get("status", payload.get("TrangThai", "SAP_CHIEU"))
        require_fields(
            {
                "movieId": movie_id_raw,
                "roomId": room_id_raw,
                "startTime": start_time_raw,
                "endTime": end_time_raw,
            },
            ["movieId", "roomId", "startTime", "endTime"],
        )
        validate_string(movie_id_raw, "movieId")
        validate_string(room_id_raw, "roomId")
        validate_string(start_time_raw, "startTime")
        validate_string(end_time_raw, "endTime")

        movie_id = parse_object_id(movie_id_raw, "movieId")
        if cinema_id_raw:
            validate_string(cinema_id_raw, "cinemaId")
            cinema_id = parse_object_id(cinema_id_raw, "cinemaId")
            room_id = parse_object_id(room_id_raw, "roomId")
        else:
            resolved = self.showtime_repo.find_room_by_identifier(room_id_raw)
            if not resolved:
                raise ApiError("Room not found", 404)
            cinema_id, room_id = resolved

        if not self.movie_repo.get_movie(movie_id):
            raise ApiError("Movie not found", 404)
        if not self.showtime_repo.get_room(cinema_id, room_id):
            raise ApiError("Room not found", 404)

        start_time = parse_iso_datetime(start_time_raw, "startTime")
        end_time = parse_iso_datetime(end_time_raw, "endTime")
        if end_time <= start_time:
            raise ApiError("endTime must be later than startTime", 400)

        if self.showtime_repo.has_conflict(room_id, start_time, end_time):
            raise ApiError("Showtime conflict in room", 409)

        showtime_doc = {
            "movieId": movie_id,
            "cinemaId": cinema_id,
            "roomId": room_id,
            "startTime": start_time,
            "endTime": end_time,
            "basePrice": payload.get("basePrice", 0),
            "status": status,
            "bookedSeats": [],
        }
        validate_int(showtime_doc["basePrice"], "basePrice", minimum=0)
        result = self.showtime_repo.create_showtime(showtime_doc)
        get_redis().delete(self.CACHE_KEY)
        created = self.showtime_repo.get_showtime(result.inserted_id)
        return to_showtime_dto(created)

    def update_showtime(self, showtime_id: str, payload: dict) -> dict:
        showtime_obj_id = parse_object_id(showtime_id, "showtimeId")
        existing = self.showtime_repo.get_showtime(showtime_obj_id)
        if not existing:
            raise ApiError("Showtime not found", 404)

        allowed_fields = ["startTime", "endTime", "status", "basePrice"]
        update_doc = {key: value for key, value in payload.items() if key in allowed_fields}
        if not update_doc:
            raise ApiError("No valid fields to update", 400)

        start_time = update_doc.get("startTime", existing["startTime"])
        end_time = update_doc.get("endTime", existing["endTime"])
        if "startTime" in update_doc:
            update_doc["startTime"] = parse_iso_datetime(update_doc["startTime"], "startTime")
            start_time = update_doc["startTime"]
        if "endTime" in update_doc:
            update_doc["endTime"] = parse_iso_datetime(update_doc["endTime"], "endTime")
            end_time = update_doc["endTime"]
        if end_time <= start_time:
            raise ApiError("endTime must be later than startTime", 400)
        if "basePrice" in update_doc:
            validate_int(update_doc["basePrice"], "basePrice", minimum=0)
        if self.showtime_repo.has_conflict(existing["roomId"], start_time, end_time, exclude_showtime_id=showtime_obj_id):
            raise ApiError("Showtime conflict in room", 409)

        self.showtime_repo.update_showtime(showtime_obj_id, update_doc)
        get_redis().delete(self.CACHE_KEY)
        updated = self.showtime_repo.get_showtime(showtime_obj_id)
        return to_showtime_dto(updated)

    def delete_showtime(self, showtime_id: str) -> dict:
        showtime_obj_id = parse_object_id(showtime_id, "showtimeId")
        existing = self.showtime_repo.get_showtime(showtime_obj_id)
        if not existing:
            raise ApiError("Showtime not found", 404)
        self.showtime_repo.delete_showtime(showtime_obj_id)
        get_redis().delete(self.CACHE_KEY)
        return {"deleted": True, "id": showtime_id}

    def import_showtimes_from_csv(self, csv_data: str) -> dict:
        import csv
        import io
        f = io.StringIO(csv_data.strip())
        reader = csv.DictReader(f)
        count = 0
        errors = []
        for row in reader:
            try:
                # Expected columns: movieId, cinemaId, roomId, startTime, endTime, basePrice
                payload = {
                    "movieId": row.get("movieId"),
                    "cinemaId": row.get("cinemaId"),
                    "roomId": row.get("roomId"),
                    "startTime": row.get("startTime"),
                    "endTime": row.get("endTime"),
                    "basePrice": int(row.get("basePrice", 0)),
                    "status": "SAP_CHIEU"
                }
                self.create_showtime(payload)
                count += 1
            except Exception as e:
                errors.append({"row": row, "error": str(e)})
        
        return {"imported": count, "errors": errors}

    def update_expired_status(self) -> int:
        modified = self.showtime_repo.mark_finished_showtimes(now_utc())
        if modified:
            get_redis().delete(self.CACHE_KEY)
        return modified
