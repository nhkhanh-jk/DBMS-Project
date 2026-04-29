from flask import Blueprint

from services.seat_service import SeatService
from utils.response import success_response

seat_bp = Blueprint("seats", __name__)
seat_service = SeatService()


@seat_bp.get("/showtime/<showtime_id>")
def list_seats_by_showtime(showtime_id: str):
    result = seat_service.list_seats_by_showtime(showtime_id)
    return success_response(result)
