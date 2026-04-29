from bson import ObjectId

from repositories.base_repository import BaseRepository


class AuthRepository:
    def __init__(self):
        self.users = BaseRepository("users")

    def get_user_by_username(self, username: str) -> dict | None:
        return self.users.find_one({"username": username})

    def get_user_by_email(self, email: str) -> dict | None:
        return self.users.find_one({"email": email})

    def get_user_by_id(self, user_id: ObjectId) -> dict | None:
        return self.users.find_one({"_id": user_id})

    def create_user(self, user_doc: dict):
        return self.users.insert_one(user_doc)

    def update_user(self, user_id: ObjectId, update_doc: dict) -> int:
        return self.users.update_one({"_id": user_id}, {"$set": update_doc})

    def delete_user(self, user_id: ObjectId) -> int:
        result = self.users.collection.delete_one({"_id": user_id})
        return result.deleted_count

    def list_users(self) -> list[dict]:
        return self.users.find_many()

    def list_staff_users(self) -> list[dict]:
        return self.users.find_many({"role": {"$in": ["ADMIN", "QUANLY", "NHANVIEN"]}})

    def list_customer_users(self) -> list[dict]:
        return self.users.find_many({"role": "KHACHHANG"})
