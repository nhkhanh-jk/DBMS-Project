from flask import Blueprint, g, request

from middleware.auth import jwt_required, roles_required
from services.auth_service import AuthService
from utils.response import success_response

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.post("/register")
def register_customer():
    data = request.get_json(silent=True) or {}
    result = auth_service.register_customer(data)
    return success_response(result, 201)


@auth_bp.post("/register-employee")
@jwt_required
@roles_required("ADMIN")
def register_employee():
    data = request.get_json(silent=True) or {}
    result = auth_service.register_employee(data)
    return success_response(result, 201)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    result = auth_service.login(data)
    return success_response(result)


@auth_bp.post("/logout")
@jwt_required
def logout():
    return success_response(auth_service.logout())


@auth_bp.get("/profile")
@jwt_required
def profile():
    result = auth_service.get_profile(g.current_user["userId"])
    return success_response(result)


@auth_bp.patch("/profile")
@jwt_required
def update_profile():
    data = request.get_json(silent=True) or {}
    result = auth_service.update_profile(g.current_user["userId"], data)
    return success_response(result)


@auth_bp.patch("/change-password")
@jwt_required
def change_password():
    data = request.get_json(silent=True) or {}
    result = auth_service.change_password(g.current_user["userId"], data)
    return success_response(result)
