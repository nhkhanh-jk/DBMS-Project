from flask import Blueprint, g, request

from middleware.auth import jwt_required, roles_required
from services.service_request_service import ServiceRequestService
from utils.response import success_response

service_request_bp = Blueprint("service_requests", __name__)
service_request_service = ServiceRequestService()


@service_request_bp.post("")
@jwt_required
@roles_required("KHACHHANG")
def create_service_request():
    data = request.get_json(silent=True) or {}
    result = service_request_service.create_request(data, g.current_user)
    return success_response(result, 201)


@service_request_bp.get("")
@jwt_required
def list_service_requests():
    result = service_request_service.list_requests(g.current_user)
    return success_response(result)


@service_request_bp.patch("/<request_id>/status")
@jwt_required
@roles_required("ADMIN", "NHANVIEN")
def update_service_request_status(request_id: str):
    data = request.get_json(silent=True) or {}
    result = service_request_service.update_status(request_id, data)
    return success_response(result)
