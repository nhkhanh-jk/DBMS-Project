from flask import Blueprint, request

from middleware.auth import jwt_required, roles_required
from services.movie_service import MovieService
from utils.response import success_response

movie_bp = Blueprint("movies", __name__)
movie_service = MovieService()


@movie_bp.get("")
def list_movies():
    result = movie_service.list_movies(request.args.get("status"))
    return success_response(result)


@movie_bp.get("/<movie_id>")
def get_movie(movie_id: str):
    result = movie_service.get_movie(movie_id)
    return success_response(result)


@movie_bp.post("")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def create_movie():
    data = request.get_json(silent=True) or {}
    result = movie_service.create_movie(data)
    return success_response(result, 201)


@movie_bp.patch("/<movie_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def update_movie(movie_id: str):
    data = request.get_json(silent=True) or {}
    result = movie_service.update_movie(movie_id, data)
    return success_response(result)


@movie_bp.put("/<movie_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def replace_movie(movie_id: str):
    data = request.get_json(silent=True) or {}
    result = movie_service.update_movie(movie_id, data)
    return success_response(result)


@movie_bp.delete("/<movie_id>")
@jwt_required
@roles_required("ADMIN", "NHANVIEN", "MANAGER", "QUANLY")
def delete_movie(movie_id: str):
    return success_response(movie_service.delete_movie(movie_id))
