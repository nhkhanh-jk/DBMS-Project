from bson import ObjectId

from repositories.base_repository import BaseRepository


class ServiceRequestRepository:
    def __init__(self):
        self.requests = BaseRepository("service_requests")

    def create_request(self, request_doc: dict):
        return self.requests.insert_one(request_doc)

    def list_requests_by_customer(self, user_id: ObjectId) -> list[dict]:
        return self.requests.find_many({"userId": user_id})

    def list_requests(self) -> list[dict]:
        return self.requests.find_many()

    def get_request(self, request_id: ObjectId) -> dict | None:
        return self.requests.find_one({"_id": request_id})

    def update_status(self, request_id: ObjectId, status: str) -> int:
        return self.requests.update_one({"_id": request_id}, {"$set": {"status": status}})
