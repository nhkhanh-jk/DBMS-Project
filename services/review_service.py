from repositories.auth_repository import AuthRepository
from repositories.movie_repository import MovieRepository
from repositories.review_repository import ReviewRepository
from utils.datetime_utils import now_utc
from utils.dto_mappers import to_review_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_int, validate_string


class ReviewService:
    def __init__(self):
        self.review_repo = ReviewRepository()
        self.movie_repo = MovieRepository()
        self.auth_repo = AuthRepository()

    def list_reviews(self, movie_id: str) -> list[dict]:
        reviews = self.review_repo.list_reviews_by_movie(parse_object_id(movie_id, "movieId"))
        return [to_review_dto(review) for review in reviews]

    def create_review(self, payload: dict, current_user: dict) -> dict:
        require_fields(payload, ["movieId", "rating", "comment"])
        validate_string(payload["movieId"], "movieId")
        validate_int(payload["rating"], "rating", minimum=1)
        if payload["rating"] > 10:
            raise ApiError("rating must be <= 10", 400)
        validate_string(payload["comment"], "comment")

        movie_id = parse_object_id(payload["movieId"], "movieId")
        if not self.movie_repo.get_movie(movie_id):
            raise ApiError("Movie not found", 404)

        user_id = parse_object_id(current_user["userId"], "userId")
        user = self.auth_repo.get_user_by_id(user_id)
        if not user or user["role"] != "KHACHHANG":
            raise ApiError("Only customer can create review", 403)

        review_doc = {
            "movieId": movie_id,
            "userId": user_id,
            "rating": payload["rating"],
            "comment": payload["comment"],
            "reviewedAt": now_utc(),
        }
        self.review_repo.create_review(review_doc)
        return to_review_dto(review_doc)
