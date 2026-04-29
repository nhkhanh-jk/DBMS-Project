from repositories.cinema_repository import CinemaRepository
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_list, validate_string


class CinemaService:
    def __init__(self):
        self.cinema_repo = CinemaRepository()

    def list_cinemas(self) -> list[dict]:
        cinemas = self.cinema_repo.list_cinemas()
        return [self._to_cinema_dto(cinema) for cinema in cinemas]

    def get_cinema(self, cinema_id: str) -> dict:
        cinema = self.cinema_repo.get_cinema(parse_object_id(cinema_id, "cinemaId"))
        if not cinema:
            raise ApiError("Cinema not found", 404)
        return self._to_cinema_dto(cinema)

    def create_cinema(self, payload: dict) -> dict:
        name = payload.get("name")
        city = payload.get("city")
        address = payload.get("address")
        rooms = payload.get("rooms", [])
        require_fields({"name": name, "city": city, "address": address}, ["name", "city", "address"])
        validate_string(name, "name")
        validate_string(city, "city")
        validate_string(address, "address")
        if rooms is not None:
            validate_list(rooms, "rooms", min_items=0)

        cinema_doc = {
            "name": name.strip(),
            "city": city.strip(),
            "address": address.strip(),
            "rooms": rooms or [],
        }
        result = self.cinema_repo.create_cinema(cinema_doc)
        created = self.cinema_repo.get_cinema(result.inserted_id)
        return self._to_cinema_dto(created)

    def update_cinema(self, cinema_id: str, payload: dict) -> dict:
        cinema_obj_id = parse_object_id(cinema_id, "cinemaId")
        cinema = self.cinema_repo.get_cinema(cinema_obj_id)
        if not cinema:
            raise ApiError("Cinema not found", 404)

        update_doc: dict = {}
        if "name" in payload:
            validate_string(payload["name"], "name")
            update_doc["name"] = payload["name"].strip()
        if "city" in payload:
            validate_string(payload["city"], "city")
            update_doc["city"] = payload["city"].strip()
        if "address" in payload:
            validate_string(payload["address"], "address")
            update_doc["address"] = payload["address"].strip()
        if "rooms" in payload:
            validate_list(payload["rooms"], "rooms", min_items=0)
            update_doc["rooms"] = payload["rooms"]

        if not update_doc:
            raise ApiError("No valid fields to update", 400)

        self.cinema_repo.update_cinema(cinema_obj_id, update_doc)
        updated = self.cinema_repo.get_cinema(cinema_obj_id)
        return self._to_cinema_dto(updated)

    def delete_cinema(self, cinema_id: str) -> dict:
        cinema_obj_id = parse_object_id(cinema_id, "cinemaId")
        existing = self.cinema_repo.get_cinema(cinema_obj_id)
        if not existing:
            raise ApiError("Cinema not found", 404)
        self.cinema_repo.delete_cinema(cinema_obj_id)
        return {"deleted": True, "id": cinema_id}

    @staticmethod
    def _to_cinema_dto(cinema: dict) -> dict:
        rooms = cinema.get("rooms", [])
        return {
            "id": str(cinema.get("_id")),
            "name": cinema.get("name"),
            "city": cinema.get("city"),
            "address": cinema.get("address"),
            "status": "active",
            "rooms": [
                {
                    "id": str(room.get("_id")),
                    "name": room.get("name"),
                    "seats": room.get("totalSeats", 0),
                    "type": "Standard",
                    "status": "active",
                }
                for room in rooms
            ],
        }
