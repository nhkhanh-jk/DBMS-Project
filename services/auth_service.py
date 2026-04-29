from repositories.auth_repository import AuthRepository
from utils.dto_mappers import to_profile_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.security import create_access_token, hash_password, verify_password
from utils.validators import require_fields, validate_string


class AuthService:
    def __init__(self):
        self.auth_repo = AuthRepository()

    def register_customer(self, payload: dict) -> dict:
        # Frontend compatibility: accepts both legacy and new keys.
        username = payload.get("username", payload.get("TenDangNhap"))
        password = payload.get("password", payload.get("MatKhau"))
        full_name = payload.get("fullName", payload.get("HoTen"))
        email = payload.get("email", payload.get("Email"))
        phone_number = payload.get("phoneNumber", payload.get("SoDienThoai", payload.get("phone")))
        if not username and email:
            username = email.split("@", 1)[0]
        if not username and phone_number:
            username = f"user{phone_number[-6:]}"
        require_fields(
            {
                "username": username,
                "password": password,
                "fullName": full_name,
                "email": email,
                "phoneNumber": phone_number,
            },
            ["username", "password", "fullName", "email", "phoneNumber"],
        )
        validate_string(username, "username")
        validate_string(password, "password", min_length=6)
        validate_string(full_name, "fullName")
        validate_string(email, "email")
        validate_string(phone_number, "phoneNumber")

        if self.auth_repo.get_user_by_username(username):
            raise ApiError("username already exists", 409)

        user_doc = {
            "username": username,
            "password": hash_password(password),
            "role": "KHACHHANG",
            "fullName": full_name,
            "email": email,
            "phoneNumber": phone_number,
            "rewardPoints": 0,
            "membershipLevel": "bronze",
        }
        if payload.get("dateOfBirth"):
            user_doc["dateOfBirth"] = payload["dateOfBirth"]
        if payload.get("gender"):
            user_doc["gender"] = payload["gender"]

        result = self.auth_repo.create_user(user_doc)
        created_user = self.auth_repo.get_user_by_id(result.inserted_id)
        return to_profile_dto(created_user)

    def register_employee(self, payload: dict) -> dict:
        username = payload.get("username", payload.get("TenDangNhap"))
        password = payload.get("password", payload.get("MatKhau"))
        full_name = payload.get("fullName", payload.get("HoTen"))
        require_fields({"username": username, "password": password, "fullName": full_name}, ["username", "password", "fullName"])
        validate_string(username, "username")
        validate_string(password, "password", min_length=6)
        validate_string(full_name, "fullName")

        if self.auth_repo.get_user_by_username(username):
            raise ApiError("username already exists", 409)

        role = (payload.get("role", payload.get("VaiTro")) or "NHANVIEN").upper()
        if role not in {"ADMIN", "QUANLY", "NHANVIEN"}:
            raise ApiError("Invalid role for employee", 400)

        user_doc = {
            "username": username,
            "password": hash_password(password),
            "role": role,
            "fullName": full_name,
            "email": payload.get("email", payload.get("Email")),
            "phoneNumber": payload.get("phoneNumber", payload.get("SoDienThoai", payload.get("phone"))),
        }
        result = self.auth_repo.create_user(user_doc)
        created_user = self.auth_repo.get_user_by_id(result.inserted_id)
        return to_profile_dto(created_user)

    def login(self, payload: dict) -> dict:
        username = payload.get("username", payload.get("TenDangNhap"))
        email = payload.get("email", payload.get("Email"))
        password = payload.get("password", payload.get("MatKhau"))
        identifier = username or email
        require_fields({"identifier": identifier, "password": password}, ["identifier", "password"])

        user = None
        if username:
            user = self.auth_repo.get_user_by_username(username)
        if not user and email:
            user = self.auth_repo.get_user_by_email(email)
        if not user and not username and identifier:
            user = self.auth_repo.get_user_by_username(identifier) or self.auth_repo.get_user_by_email(identifier)
        if not user or not verify_password(password, user["password"]):
            raise ApiError("Invalid credentials", 401)

        role = (user.get("role") or "").upper()
        access_token = create_access_token(str(user["_id"]), role)
        return {
            "accessToken": access_token,
            "profile": to_profile_dto(user),
        }

    def login_with_roles(self, payload: dict, allowed_roles: set[str]) -> dict:
        result = self.login(payload)
        role = (result["profile"].get("role") or "").upper()
        normalized_allowed = {(item or "").upper() for item in allowed_roles}
        if role not in normalized_allowed:
            raise ApiError("Forbidden role for this login endpoint", 403)
        return result

    @staticmethod
    def logout() -> dict:
        return {"message": "Logout successful"}

    def get_profile(self, user_id: str) -> dict:
        user = self.auth_repo.get_user_by_id(parse_object_id(user_id, "userId"))
        if not user:
            raise ApiError("User not found", 404)
        return to_profile_dto(user)

    def update_profile(self, user_id: str, payload: dict) -> dict:
        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("User not found", 404)

        update_doc: dict = {}
        if "fullName" in payload:
            validate_string(payload["fullName"], "fullName")
            update_doc["fullName"] = payload["fullName"].strip()
        if "phoneNumber" in payload:
            validate_string(payload["phoneNumber"], "phoneNumber")
            update_doc["phoneNumber"] = payload["phoneNumber"].strip()
        if "gender" in payload and payload["gender"]:
            validate_string(payload["gender"], "gender")
            update_doc["gender"] = payload["gender"].strip()
        if "dateOfBirth" in payload and payload["dateOfBirth"]:
            validate_string(payload["dateOfBirth"], "dateOfBirth")
            update_doc["dateOfBirth"] = payload["dateOfBirth"].strip()

        if not update_doc:
            raise ApiError("No valid profile fields to update", 400)

        self.auth_repo.update_user(user_obj_id, update_doc)
        updated_user = self.auth_repo.get_user_by_id(user_obj_id)
        return to_profile_dto(updated_user)

    def change_password(self, user_id: str, payload: dict) -> dict:
        current_password = payload.get("currentPassword")
        new_password = payload.get("newPassword")
        require_fields({"currentPassword": current_password, "newPassword": new_password}, ["currentPassword", "newPassword"])
        validate_string(current_password, "currentPassword", min_length=6)
        validate_string(new_password, "newPassword", min_length=6)

        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("User not found", 404)
        if not verify_password(current_password, user["password"]):
            raise ApiError("Current password is incorrect", 400)
        if verify_password(new_password, user["password"]):
            raise ApiError("New password must be different", 400)

        self.auth_repo.update_user(user_obj_id, {"password": hash_password(new_password)})
        return {"message": "Password updated successfully"}
