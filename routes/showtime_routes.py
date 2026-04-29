from flask import Blueprint, request

from middleware.auth import jwt_required, roles_required
from services.seat_service import SeatService
from services.showtime_service import ShowtimeService
from utils.response import success_response

showtime_bp = Blueprint("showtimes", __name__)
showtime_service = ShowtimeService()
seat_service = SeatService()


@showtime_bp.get("")
def list_showtimes():
    result = showtime_service.list_showtimes(
        movie_id=request.args.get("movieId"),
        cinema_id=request.args.get("cinemaId"),
        room_id=request.args.get("roomId"),
        date_value=request.args.get("date"),
    )
    return success_response(result)


@showtime_bp.get("/<showtime_id>")
def get_showtime(showtime_id: str):
    result = showtime_service.get_showtime(showtime_id)
    return success_response(result)


@showtime_bp.get("/<showtime_id>/seats")
def list_showtime_seats(showtime_id: str):
    return success_response(seat_service.list_seats_by_showtime(showtime_id))


@showtime_bp.post("")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def create_showtime():
    data = request.get_json(silent=True) or {}
    result = showtime_service.create_showtime(data)
    return success_response(result, 201)


@showtime_bp.patch("/<showtime_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def update_showtime(showtime_id: str):
    data = request.get_json(silent=True) or {}
    result = showtime_service.update_showtime(showtime_id, data)
    return success_response(result)


@showtime_bp.put("/<showtime_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def replace_showtime(showtime_id: str):
    data = request.get_json(silent=True) or {}
    result = showtime_service.update_showtime(showtime_id, data)
    return success_response(result)


@showtime_bp.delete("/<showtime_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def delete_showtime(showtime_id: str):
    return success_response(showtime_service.delete_showtime(showtime_id))
