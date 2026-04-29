from flask import Blueprint, request

from middleware.auth import jwt_required, roles_required
from services.admin_service import AdminService
from services.auth_service import AuthService
from services.report_service import ReportService
from services.showtime_service import ShowtimeService
from utils.response import success_response

manager_bp = Blueprint("manager", __name__)
auth_service = AuthService()
showtime_service = ShowtimeService()
report_service = ReportService()
admin_service = AdminService()


@manager_bp.post("/auth/login")
def manager_login():
    data = request.get_json(silent=True) or {}
    return success_response(auth_service.login_with_roles(data, {"MANAGER", "QUANLY"}))


@manager_bp.get("/showtimes")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def list_manager_showtimes():
    result = showtime_service.list_showtimes(
        movie_id=request.args.get("movieId"),
        cinema_id=request.args.get("cinemaId"),
        room_id=request.args.get("roomId"),
        date_value=request.args.get("date"),
    )
    return success_response(result)


@manager_bp.post("/showtimes")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def create_manager_showtime():
    data = request.get_json(silent=True) or {}
    return success_response(showtime_service.create_showtime(data), 201)


@manager_bp.put("/showtimes/<showtime_id>")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def update_manager_showtime(showtime_id: str):
    data = request.get_json(silent=True) or {}
    return success_response(showtime_service.update_showtime(showtime_id, data))


@manager_bp.delete("/showtimes/<showtime_id>")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def delete_manager_showtime(showtime_id: str):
    return success_response(showtime_service.delete_showtime(showtime_id))


@manager_bp.get("/staffs")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def list_manager_staffs():
    return success_response(admin_service.list_staff())


@manager_bp.get("/staffs/<staff_id>")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def get_manager_staff_detail(staff_id: str):
    return success_response(admin_service.get_staff_detail(staff_id))


@manager_bp.post("/showtimes/import")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def import_manager_showtimes():
    # Support CSV data in request body (as text)
    csv_data = request.get_data(as_text=True)
    if not csv_data:
        raise ApiError("No CSV data provided", 400)
    return success_response(showtime_service.import_showtimes_from_csv(csv_data))


@manager_bp.get("/reports/summary")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def manager_summary_report():
    return success_response(report_service.get_overview())


@manager_bp.get("/reports/movies")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def manager_movie_report():
    return success_response(
        report_service.get_movie_report(
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )


@manager_bp.get("/reports/cinemas")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def manager_cinema_report():
    return success_response(
        report_service.get_cinema_report(
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )


@manager_bp.get("/reports/revenue")
@jwt_required
@roles_required("MANAGER", "QUANLY", "ADMIN")
def manager_revenue_report():
    return success_response(
        report_service.get_revenue_report(
            view=request.args.get("view", "weekly"),
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )
