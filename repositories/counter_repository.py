from pymongo import ReturnDocument

from db.mongo import get_db


class CounterRepository:
    def __init__(self):
        self.collection = get_db()["COUNTERS"]

    def next_id(self, key: str, prefix: str) -> str:
        result = self.collection.find_one_and_update(
            {"_id": key},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return f"{prefix}{result['seq']:06d}"

