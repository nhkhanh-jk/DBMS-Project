from flask import Blueprint

from utils.response import success_response

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    return success_response({"status": "ok"})

