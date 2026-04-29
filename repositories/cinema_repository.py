from bson import ObjectId

from repositories.base_repository import BaseRepository


class CinemaRepository:
    def __init__(self):
        self.cinemas = BaseRepository("cinemas")

    def list_cinemas(self) -> list[dict]:
        return self.cinemas.find_many()

    def get_cinema(self, cinema_id: ObjectId) -> dict | None:
        return self.cinemas.find_one({"_id": cinema_id})

    def create_cinema(self, cinema_doc: dict):
        return self.cinemas.insert_one(cinema_doc)

    def update_cinema(self, cinema_id: ObjectId, cinema_doc: dict) -> int:
        return self.cinemas.update_one({"_id": cinema_id}, {"$set": cinema_doc})

    def delete_cinema(self, cinema_id: ObjectId) -> int:
        result = self.cinemas.collection.delete_one({"_id": cinema_id})
        return result.deleted_count
