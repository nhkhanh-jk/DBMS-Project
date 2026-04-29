from flask import Blueprint, g, request

from middleware.auth import jwt_required
from services.auth_service import AuthService
from services.booking_service import BookingService
from utils.response import success_response

user_bp = Blueprint("users", __name__)
auth_service = AuthService()
booking_service = BookingService()


@user_bp.get("/profile")
@jwt_required
def get_profile():
    return success_response(auth_service.get_profile(g.current_user["userId"]))


@user_bp.put("/profile")
@jwt_required
def update_profile():
    data = request.get_json(silent=True) or {}
    return success_response(auth_service.update_profile(g.current_user["userId"], data))


@user_bp.patch("/profile")
@jwt_required
def patch_profile():
    data = request.get_json(silent=True) or {}
    return success_response(auth_service.update_profile(g.current_user["userId"], data))


@user_bp.get("/tickets")
@jwt_required
def list_user_tickets():
    status = request.args.get("status")
    return success_response(booking_service.list_my_bookings(g.current_user, status))
