from flask import Blueprint, request

from middleware.auth import jwt_required, roles_required
from services.admin_service import AdminService
from services.auth_service import AuthService
from services.cinema_service import CinemaService
from services.movie_service import MovieService
from utils.errors import ApiError
from utils.response import success_response

admin_bp = Blueprint("admin", __name__)
admin_service = AdminService()
auth_service = AuthService()
movie_service = MovieService()
cinema_service = CinemaService()


@admin_bp.post("/auth/login")
def admin_login():
    data = request.get_json(silent=True) or {}
    return success_response(auth_service.login_with_roles(data, {"ADMIN"}))


@admin_bp.get("/users")
@jwt_required
@roles_required("ADMIN")
def list_users():
    return success_response(admin_service.list_users())


@admin_bp.get("/staff")
@jwt_required
@roles_required("ADMIN")
def list_staff():
    return success_response(admin_service.list_staff())


@admin_bp.get("/staffs")
@jwt_required
@roles_required("ADMIN")
def list_staff_plural():
    return success_response(admin_service.list_staff())


@admin_bp.patch("/users/<user_id>/status")
@jwt_required
@roles_required("ADMIN")
def update_user_status(user_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.update_user_status(user_id, data))


@admin_bp.put("/users/<user_id>/status")
@jwt_required
@roles_required("ADMIN")
def replace_user_status(user_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.update_user_status(user_id, data))


@admin_bp.post("/staff")
@jwt_required
@roles_required("ADMIN")
def create_staff():
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.create_staff(data), 201)


@admin_bp.post("/staffs")
@jwt_required
@roles_required("ADMIN")
def create_staff_plural():
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.create_staff(data), 201)


@admin_bp.patch("/staff/<user_id>")
@jwt_required
@roles_required("ADMIN")
def update_staff(user_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.update_staff(user_id, data))


@admin_bp.put("/staffs/<user_id>")
@jwt_required
@roles_required("ADMIN")
def replace_staff_plural(user_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.update_staff(user_id, data))


@admin_bp.patch("/staffs/<user_id>")
@jwt_required
@roles_required("ADMIN")
def update_staff_plural(user_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(admin_service.update_staff(user_id, data))


@admin_bp.delete("/staffs/<user_id>")
@jwt_required
@roles_required("ADMIN")
def delete_staff_plural(user_id: str):
    return success_response(admin_service.delete_staff(user_id))


@admin_bp.get("/movies")
@jwt_required
@roles_required("ADMIN")
def list_admin_movies():
    try:
        page = int(request.args.get("page", 1) or 1)
        limit = int(request.args.get("limit", 20) or 20)
    except ValueError as exc:
        raise ApiError("page and limit must be integers", 400) from exc
    if page < 1 or limit < 1:
        raise ApiError("page and limit must be >= 1", 400)
    search = request.args.get("search")
    status = request.args.get("status")
    return success_response(movie_service.list_movies_for_admin(page=page, limit=limit, search=search, status=status))


@admin_bp.post("/movies")
@jwt_required
@roles_required("ADMIN")
def create_admin_movie():
    data = request.get_json(silent=True) or {}
    return success_response(movie_service.create_movie(data), 201)


@admin_bp.put("/movies/<movie_id>")
@jwt_required
@roles_required("ADMIN")
def update_admin_movie(movie_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(movie_service.update_movie(movie_id, data))


@admin_bp.delete("/movies/<movie_id>")
@jwt_required
@roles_required("ADMIN")
def delete_admin_movie(movie_id: str):
    return success_response(movie_service.delete_movie(movie_id))


@admin_bp.get("/cinemas")
@jwt_required
@roles_required("ADMIN")
def list_admin_cinemas():
    return success_response(cinema_service.list_cinemas())


@admin_bp.post("/cinemas")
@jwt_required
@roles_required("ADMIN")
def create_admin_cinema():
    data = request.get_json(silent=True) or {}
    return success_response(cinema_service.create_cinema(data), 201)


@admin_bp.put("/cinemas/<cinema_id>")
@jwt_required
@roles_required("ADMIN")
def update_admin_cinema(cinema_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(cinema_service.update_cinema(cinema_id, data))


@admin_bp.delete("/cinemas/<cinema_id>")
@jwt_required
@roles_required("ADMIN")
def delete_admin_cinema(cinema_id: str):
    return success_response(cinema_service.delete_cinema(cinema_id))
