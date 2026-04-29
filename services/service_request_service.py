from repositories.auth_repository import AuthRepository
from repositories.service_request_repository import ServiceRequestRepository
from utils.dto_mappers import to_service_request_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_string


class ServiceRequestService:
    def __init__(self):
        self.request_repo = ServiceRequestRepository()
        self.auth_repo = AuthRepository()

    def create_request(self, payload: dict, current_user: dict) -> dict:
        require_fields(payload, ["requestType", "requestDetail"])
        validate_string(payload["requestType"], "requestType")
        validate_string(payload["requestDetail"], "requestDetail")

        user_id = parse_object_id(current_user["userId"], "userId")
        user = self.auth_repo.get_user_by_id(user_id)
        if not user or user["role"] != "KHACHHANG":
            raise ApiError("Only customer can create service request", 403)

        request_doc = {
            "userId": user_id,
            "requestType": payload["requestType"],
            "requestDetail": payload["requestDetail"],
            "status": "MOI",
        }
        self.request_repo.create_request(request_doc)
        return to_service_request_dto(request_doc)

    def list_requests(self, current_user: dict) -> list[dict]:
        if current_user["role"] == "KHACHHANG":
            user_id = parse_object_id(current_user["userId"], "userId")
            docs = self.request_repo.list_requests_by_customer(user_id)
        else:
            docs = self.request_repo.list_requests()
        return [to_service_request_dto(doc) for doc in docs]

    def update_status(self, request_id: str, payload: dict) -> dict:
        require_fields(payload, ["status"])
        validate_string(payload["status"], "status")
        request_obj_id = parse_object_id(request_id, "requestId")
        existing = self.request_repo.get_request(request_obj_id)
        if not existing:
            raise ApiError("Service request not found", 404)

        self.request_repo.update_status(request_obj_id, payload["status"])
        updated = self.request_repo.get_request(request_obj_id)
        return to_service_request_dto(updated)
