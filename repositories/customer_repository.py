from bson import ObjectId

from repositories.base_repository import BaseRepository


class CustomerRepository:
    def __init__(self):
        self.users = BaseRepository("users")

    def get_customer_by_id(self, user_id: ObjectId) -> dict | None:
        return self.users.find_one({"_id": user_id, "role": "KHACHHANG"})

    def update_points_and_tier(self, user_id: ObjectId, points: int, tier: str) -> int:
        return self.users.update_one(
            {"_id": user_id},
            {"$set": {"rewardPoints": points, "membershipLevel": tier}},
        )
