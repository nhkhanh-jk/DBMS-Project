from pymongo.collection import Collection

from db.mongo import get_db


class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name

    @property
    def collection(self) -> Collection:
        return get_db()[self.collection_name]

    def find_one(self, query: dict, projection: dict | None = None) -> dict | None:
        return self.collection.find_one(query, projection)

    def find_many(self, query: dict | None = None, sort: list | None = None) -> list[dict]:
        cursor = self.collection.find(query or {})
        if sort:
            cursor = cursor.sort(sort)
        return list(cursor)

    def insert_one(self, document: dict):
        return self.collection.insert_one(document)

    def insert_many(self, documents: list[dict]):
        if documents:
            return self.collection.insert_many(documents)
        return None

    def update_one(self, query: dict, update: dict) -> int:
        result = self.collection.update_one(query, update)
        return result.modified_count
