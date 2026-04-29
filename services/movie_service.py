import json

from flask import current_app

from cache.redis_client import get_redis
from repositories.movie_repository import MovieRepository
from utils.datetime_utils import parse_iso_datetime
from utils.dto_mappers import to_movie_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_int, validate_list, validate_string


class MovieService:
    CACHE_KEY = "movies:list"

    def __init__(self):
        self.movie_repo = MovieRepository()

    def list_movies(self, status: str | None = None) -> list[dict]:
        if not status:
            cached = get_redis().get(self.CACHE_KEY)
            if cached:
                return json.loads(cached)

        movies = self.movie_repo.list_movies(status)
        dto_list = [to_movie_dto(movie) for movie in movies]

        if not status:
            get_redis().setex(self.CACHE_KEY, current_app.config["CACHE_TTL_SECONDS"], json.dumps(dto_list))
        return dto_list

    def list_movies_for_admin(self, page: int = 1, limit: int = 20, search: str | None = None, status: str | None = None) -> dict:
        movies = self.movie_repo.list_movies(status)
        dto_list = [to_movie_dto(movie) for movie in movies]
        search_value = (search or "").strip().lower()
        if search_value:
            dto_list = [item for item in dto_list if search_value in (item.get("title") or "").lower()]

        total = len(dto_list)
        start = max(page - 1, 0) * limit
        end = start + limit
        items = dto_list[start:end]
        return {
            "items": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
            },
        }

    def get_movie(self, movie_id: str) -> dict:
        movie = self.movie_repo.get_movie(parse_object_id(movie_id, "movieId"))
        if not movie:
            raise ApiError("Movie not found", 404)
        return to_movie_dto(movie)

    def create_movie(self, payload: dict) -> dict:
        # Frontend compatibility: legacy keys TenPhim/TheLoai/ThoiLuong/NgayPhatHanh/TrangThai.
        title = payload.get("title", payload.get("TenPhim"))
        raw_genres = payload.get("genres", payload.get("TheLoai"))
        if isinstance(raw_genres, str):
            genres = [raw_genres] if raw_genres.strip() else []
        else:
            genres = raw_genres
        duration_min = payload.get("durationMin", payload.get("ThoiLuong", payload.get("duration")))
        release_date = payload.get("releaseDate", payload.get("NgayPhatHanh"))
        status = payload.get("status", payload.get("TrangThai", "SAP_CHIEU"))
        description = payload.get("description", payload.get("MoTa"))

        require_fields(
            {"title": title, "genres": genres, "durationMin": duration_min, "releaseDate": release_date},
            ["title", "genres", "durationMin", "releaseDate"],
        )
        validate_string(title, "title")
        validate_list(genres, "genres", min_items=1)
        for genre in genres:
            validate_string(genre, "genres[]")
        validate_int(duration_min, "durationMin", minimum=1)
        validate_string(release_date, "releaseDate")
        release_dt = parse_iso_datetime(release_date, "releaseDate")

        movie_doc = {
            "title": title,
            "genres": genres,
            "description": description,
            "durationMin": duration_min,
            "releaseDate": release_dt,
            "status": status,
        }
        result = self.movie_repo.create_movie(movie_doc)
        get_redis().delete(self.CACHE_KEY)
        created = self.movie_repo.get_movie(result.inserted_id)
        return to_movie_dto(created)

    def update_movie(self, movie_id: str, payload: dict) -> dict:
        movie_obj_id = parse_object_id(movie_id, "movieId")
        existing = self.movie_repo.get_movie(movie_obj_id)
        if not existing:
            raise ApiError("Movie not found", 404)

        legacy_to_new = {
            "TenPhim": "title",
            "TheLoai": "genres",
            "MoTa": "description",
            "ThoiLuong": "durationMin",
            "NgayPhatHanh": "releaseDate",
            "TrangThai": "status",
        }
        normalized_payload = payload.copy()
        for old_key, new_key in legacy_to_new.items():
            if old_key in payload and new_key not in normalized_payload:
                normalized_payload[new_key] = payload[old_key]
        if "genres" in normalized_payload and isinstance(normalized_payload["genres"], str):
            normalized_payload["genres"] = [normalized_payload["genres"]] if normalized_payload["genres"].strip() else []

        allowed_fields = ["title", "genres", "description", "durationMin", "releaseDate", "status"]
        update_doc = {key: value for key, value in normalized_payload.items() if key in allowed_fields}
        if not update_doc:
            raise ApiError("No valid fields to update", 400)
        if "genres" in update_doc:
            validate_list(update_doc["genres"], "genres", min_items=1)
            for genre in update_doc["genres"]:
                validate_string(genre, "genres[]")
        if "durationMin" in update_doc:
            validate_int(update_doc["durationMin"], "durationMin", minimum=1)
        if "releaseDate" in update_doc:
            validate_string(update_doc["releaseDate"], "releaseDate")
            update_doc["releaseDate"] = parse_iso_datetime(update_doc["releaseDate"], "releaseDate")

        self.movie_repo.update_movie(movie_obj_id, update_doc)
        get_redis().delete(self.CACHE_KEY)
        updated = self.movie_repo.get_movie(movie_obj_id)
        return to_movie_dto(updated)

    def delete_movie(self, movie_id: str) -> dict:
        movie_obj_id = parse_object_id(movie_id, "movieId")
        existing = self.movie_repo.get_movie(movie_obj_id)
        if not existing:
            raise ApiError("Movie not found", 404)
        self.movie_repo.delete_movie(movie_obj_id)
        get_redis().delete(self.CACHE_KEY)
        return {"deleted": True, "id": movie_id}
