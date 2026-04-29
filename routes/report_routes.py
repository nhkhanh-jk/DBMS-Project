from flask import Blueprint, request

from middleware.auth import jwt_required, roles_required
from services.report_service import ReportService
from utils.response import success_response

report_bp = Blueprint("reports", __name__)
report_service = ReportService()


@report_bp.get("/overview")
@jwt_required
@roles_required("ADMIN", "MANAGER", "QUANLY")
def overview_report():
    return success_response(report_service.get_overview())


@report_bp.get("/revenue")
@jwt_required
@roles_required("ADMIN", "MANAGER", "QUANLY")
def revenue_report():
    return success_response(
        report_service.get_revenue_report(
            view=request.args.get("view", "weekly"),
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )


@report_bp.get("/movies")
@jwt_required
@roles_required("ADMIN", "MANAGER", "QUANLY")
def movie_report():
    return success_response(
        report_service.get_movie_report(
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )


@report_bp.get("/cinemas")
@jwt_required
@roles_required("ADMIN", "MANAGER", "QUANLY")
def cinema_report():
    return success_response(
        report_service.get_cinema_report(
            start_date=request.args.get("startDate"),
            end_date=request.args.get("endDate"),
        )
    )
