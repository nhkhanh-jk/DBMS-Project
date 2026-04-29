from flask import Blueprint

from services.cinema_service import CinemaService
from utils.response import success_response

cinema_bp = Blueprint("cinemas", __name__)
cinema_service = CinemaService()


@cinema_bp.get("")
def list_cinemas():
    return success_response(cinema_service.list_cinemas())


@cinema_bp.get("/<cinema_id>")
def get_cinema(cinema_id: str):
    return success_response(cinema_service.get_cinema(cinema_id))
