import os
from datetime import UTC, datetime

from bson import ObjectId
from pymongo import MongoClient
from redis import Redis

from workers.celery_app import celery_app


def _get_db():
    client = MongoClient(
        os.getenv(
            "MONGO_URI",
            "mongodb+srv://<username>:<password>@cluster0.s3kz7dx.mongodb.net/CinemaManagement?retryWrites=true&w=majority",
        )
    )
    db_name = os.getenv("MONGO_DB_NAME", "CinemaManagement")
    return client[db_name]


def _get_redis():
    return Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"), decode_responses=True)


def _tier_from_points(points: int) -> str:
    if points >= 500:
        return "gold"
    if points >= 200:
        return "silver"
    return "bronze"


@celery_app.task(name="workers.tasks.send_booking_confirmation")
def send_booking_confirmation(email: str, booking_summary: dict):
    print(f"[BookingConfirmation] To={email} Summary={booking_summary}")
    return {"sent": True, "email": email}


@celery_app.task(name="workers.tasks.calculate_loyalty_points")
def calculate_loyalty_points(user_id: str, total_price: int):
    db = _get_db()
    users = db["users"]
    customer = users.find_one({"_id": ObjectId(user_id), "role": "KHACHHANG"})
    if not customer:
        return {"updated": False, "reason": "User not found or not KHACHHANG"}

    current_points = customer.get("rewardPoints", 0)
    added_points = total_price // 10000
    new_points = current_points + added_points
    new_tier = _tier_from_points(new_points)

    users.update_one(
        {"_id": customer["_id"]},
        {"$set": {"rewardPoints": new_points, "membershipLevel": new_tier}},
    )
    return {"updated": True, "rewardPoints": new_points, "membershipLevel": new_tier}


@celery_app.task(name="workers.tasks.update_showtime_status")
def update_showtime_status():
    db = _get_db()
    showtimes = db["showtimes"]
    now_dt = datetime.now(UTC)

    result = showtimes.update_many(
        {"endTime": {"$lte": now_dt}, "status": {"$ne": "DA_CHIEU"}},
        {"$set": {"status": "DA_CHIEU"}},
    )
    if result.modified_count > 0:
        _get_redis().delete("showtimes:list")
    return {"updated": result.modified_count}
