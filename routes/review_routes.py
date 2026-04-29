from flask import Blueprint, g, request

from middleware.auth import jwt_required, roles_required
from services.review_service import ReviewService
from utils.response import success_response

review_bp = Blueprint("reviews", __name__)
review_service = ReviewService()


@review_bp.get("/movie/<movie_id>")
def list_reviews(movie_id: str):
    result = review_service.list_reviews(movie_id)
    return success_response(result)


@review_bp.post("")
@jwt_required
@roles_required("KHACHHANG")
def create_review():
    data = request.get_json(silent=True) or {}
    result = review_service.create_review(data, g.current_user)
    return success_response(result, 201)
