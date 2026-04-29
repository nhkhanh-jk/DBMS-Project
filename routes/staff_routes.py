from datetime import datetime

from flask import Blueprint, g, request

from middleware.auth import jwt_required, roles_required
from services.auth_service import AuthService
from services.booking_service import BookingService
from services.showtime_service import ShowtimeService
from utils.errors import ApiError
from utils.response import success_response

staff_bp = Blueprint("staff", __name__)
auth_service = AuthService()
showtime_service = ShowtimeService()
booking_service = BookingService()


@staff_bp.post("/auth/login")
def staff_login():
    data = request.get_json(silent=True) or {}
    return success_response(auth_service.login_with_roles(data, {"NHANVIEN", "STAFF"}))


@staff_bp.get("/showtimes/today")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def list_today_showtimes():
    date_value = request.args.get("date") or datetime.now().date().isoformat()
    cinema_id = request.args.get("cinemaId")
    result = showtime_service.list_showtimes(cinema_id=cinema_id, date_value=date_value)
    return success_response(result)


@staff_bp.get("/showtimes/<showtime_id>/seats")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def list_staff_seats(showtime_id: str):
    return success_response(seat_service.list_seats_by_showtime(showtime_id))


@staff_bp.get("/reports/summary")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def staff_summary_report():
    from services.report_service import ReportService
    report_service = ReportService()
    return success_response(report_service.get_staff_summary())


@staff_bp.get("/shift/info")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def get_staff_shift_info():
    # Mocking shift info as it is not in current DB schema
    user = g.current_user
    return success_response({
        "userId": user["userId"],
        "shiftStart": "08:00",
        "shiftEnd": "16:00",
        "position": user.get("role", "NHANVIEN"),
        "cinema": "TNC Cinema Center"
    })


@staff_bp.post("/bookings")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def create_counter_booking():
    data = request.get_json(silent=True) or {}
    customer_info = data.get("customerInfo")
    if isinstance(customer_info, dict) and customer_info.get("userId") and not data.get("userId"):
        data["userId"] = customer_info["userId"]
    result = booking_service.create_booking(data, g.current_user)
    return success_response(result, 201)


@staff_bp.post("/tickets/check")
@jwt_required
@roles_required("NHANVIEN", "ADMIN", "MANAGER", "QUANLY")
def check_ticket():
    data = request.get_json(silent=True) or {}
    ticket_code = (data.get("ticketCode") or "").strip()
    if not ticket_code:
        raise ApiError("ticketCode is required", 400)
    return success_response(booking_service.check_and_consume_ticket_code(ticket_code))
