from bson import ObjectId

from repositories.base_repository import BaseRepository


class MovieRepository:
    def __init__(self):
        self.movies = BaseRepository("movies")

    def list_movies(self, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        return self.movies.find_many(query)

    def get_movie(self, movie_id: ObjectId) -> dict | None:
        return self.movies.find_one({"_id": movie_id})

    def create_movie(self, movie_doc: dict):
        return self.movies.insert_one(movie_doc)

    def update_movie(self, movie_id: ObjectId, movie_doc: dict) -> int:
        return self.movies.update_one({"_id": movie_id}, {"$set": movie_doc})

    def delete_movie(self, movie_id: ObjectId) -> int:
        result = self.movies.collection.delete_one({"_id": movie_id})
        return result.deleted_count
