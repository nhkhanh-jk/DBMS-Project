from flask import Blueprint, g, request

from middleware.auth import jwt_required, roles_required
from services.booking_service import BookingService
from utils.response import success_response

booking_bp = Blueprint("bookings", __name__)
booking_service = BookingService()


@booking_bp.post("")
@jwt_required
def create_booking():
    data = request.get_json(silent=True) or {}
    result = booking_service.create_booking(data, g.current_user)
    return success_response(result, 201)


@booking_bp.get("/<booking_id>")
@jwt_required
def get_booking(booking_id: str):
    result = booking_service.get_booking(booking_id)
    return success_response(result)


@booking_bp.get("/me")
@jwt_required
def list_my_bookings():
    result = booking_service.list_my_bookings(g.current_user, request.args.get("status"))
    return success_response(result)


@booking_bp.get("/code/<booking_code>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def get_booking_by_code(booking_code: str):
    result = booking_service.get_booking_by_code(booking_code)
    return success_response(result)


@booking_bp.patch("/<booking_id>/consume")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def consume_booking(booking_id: str):
    result = booking_service.consume_booking(booking_id)
    return success_response(result)
