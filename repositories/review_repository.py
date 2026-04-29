from bson import ObjectId

from repositories.base_repository import BaseRepository


class ReviewRepository:
    def __init__(self):
        self.reviews = BaseRepository("reviews")

    def list_reviews_by_movie(self, movie_id: ObjectId) -> list[dict]:
        return self.reviews.find_many({"movieId": movie_id}, sort=[("reviewedAt", -1)])

    def create_review(self, review_doc: dict):
        return self.reviews.insert_one(review_doc)
