from repositories.auth_repository import AuthRepository
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.security import hash_password
from utils.validators import require_fields, validate_string


def _map_role_for_frontend(role: str | None) -> str:
    return (role or "").upper()


class AdminService:
    def __init__(self):
        self.auth_repo = AuthRepository()

    def list_users(self) -> list[dict]:
        users = self.auth_repo.list_users()
        docs: list[dict] = []
        for user in users:
            docs.append(
                {
                    "id": str(user.get("_id")),
                    "name": user.get("fullName") or user.get("username") or "Unknown",
                    "email": user.get("email") or "",
                    "phone": user.get("phoneNumber") or "",
                    "role": _map_role_for_frontend(user.get("role")),
                    "status": user.get("status", "active"),
                    "joined": (user.get("createdAt") or user.get("_id").generation_time).strftime("%d/%m/%Y"),
                }
            )
        return docs

    def list_staff(self) -> list[dict]:
        users = self.auth_repo.list_staff_users()
        docs: list[dict] = []
        for user in users:
            role = _map_role_for_frontend(user.get("role"))
            docs.append(
                {
                    "id": str(user.get("_id")),
                    "name": user.get("fullName") or user.get("username") or "Unknown",
                    "email": user.get("email") or "",
                    "phone": user.get("phoneNumber") or "",
                    "position": "Quản lý ca" if role == "QUANLY" else "Nhân viên bán vé",
                    "cinema": user.get("cinema", "TNC"),
                    "shift": user.get("shift", "Sáng"),
                    "status": user.get("status", "active"),
                    "role": role,
                }
            )
        return docs

    def get_staff_detail(self, user_id: str) -> dict:
        from repositories.base_repository import BaseRepository
        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("Staff not found", 404)

        role = _map_role_for_frontend(user.get("role"))
        # ...
        bookings_repo = BaseRepository("bookings")
        bookings = bookings_repo.find_many({"staffId": user_obj_id})
        
        total_bookings = len(bookings)
        total_revenue = sum(b.get("totalPrice", 0) for b in bookings)
        
        # Booking history (last 10)
        history = []
        for b in bookings[:10]:
            history.append({
                "bookingCode": b.get("bookingCode"),
                "totalPrice": b.get("totalPrice"),
                "bookingTime": b.get("bookingTime").isoformat() if b.get("bookingTime") else None
            })

        return {
            "id": str(user.get("_id")),
            "name": user.get("fullName") or user.get("username"),
            "email": user.get("email") or "",
            "phone": user.get("phoneNumber") or "",
            "position": user.get("position", "Nhân viên bán vé"),
            "cinema": user.get("cinema", "TNC"),
            "shift": user.get("shift", "Sáng"),
            "status": user.get("status", "active"),
            "role": role,
            "performance": {
                "totalBookings": total_bookings,
                "totalRevenue": total_revenue
            },
            "history": history
        }

    def update_user_status(self, user_id: str, payload: dict) -> dict:
        status = (payload.get("status") or "").strip().lower()
        if status not in {"active", "locked", "inactive"}:
            raise ApiError("status must be one of: active, locked, inactive", 400)

        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("User not found", 404)

        self.auth_repo.update_user(user_obj_id, {"status": status})
        updated = self.auth_repo.get_user_by_id(user_obj_id)
        return {
            "id": str(updated.get("_id")),
            "status": updated.get("status", "active"),
        }

    def create_staff(self, payload: dict) -> dict:
        name = payload.get("name")
        email = payload.get("email")
        phone = payload.get("phone")
        position = payload.get("position", "Nhân viên bán vé")
        role = (payload.get("role") or "NHANVIEN").upper()

        require_fields({"name": name, "email": email, "phone": phone}, ["name", "email", "phone"])
        validate_string(name, "name")
        validate_string(email, "email")
        validate_string(phone, "phone")
        validate_string(position, "position")

        if role not in {"ADMIN", "QUANLY", "NHANVIEN"}:
            raise ApiError("Invalid role", 400)

        username = payload.get("username")
        if not username:
            base = "".join(ch for ch in name.lower() if ch.isalnum())[:10] or "staff"
            username = f"{base}{phone[-4:]}"
        if self.auth_repo.get_user_by_username(username):
            raise ApiError("username already exists", 409)

        default_password = payload.get("password") or "123456"
        validate_string(default_password, "password", min_length=6)

        user_doc = {
            "username": username,
            "password": hash_password(default_password),
            "role": role,
            "fullName": name.strip(),
            "email": email.strip(),
            "phoneNumber": phone.strip(),
            "position": position.strip(),
            "cinema": payload.get("cinema", "TNC"),
            "shift": payload.get("shift", "Sáng"),
            "status": payload.get("status", "active"),
        }
        result = self.auth_repo.create_user(user_doc)
        created = self.auth_repo.get_user_by_id(result.inserted_id)
        return {
            "id": str(created.get("_id")),
            "name": created.get("fullName") or created.get("username"),
            "email": created.get("email") or "",
            "phone": created.get("phoneNumber") or "",
            "position": created.get("position", "Nhân viên bán vé"),
            "cinema": created.get("cinema", "TNC"),
            "shift": created.get("shift", "Sáng"),
            "status": created.get("status", "active"),
            "role": created.get("role"),
            "username": created.get("username"),
            "defaultPassword": default_password,
        }

    def update_staff(self, user_id: str, payload: dict) -> dict:
        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("Staff not found", 404)

        update_doc: dict = {}
        if "name" in payload:
            validate_string(payload["name"], "name")
            update_doc["fullName"] = payload["name"].strip()
        if "email" in payload:
            validate_string(payload["email"], "email")
            update_doc["email"] = payload["email"].strip()
        if "phone" in payload:
            validate_string(payload["phone"], "phone")
            update_doc["phoneNumber"] = payload["phone"].strip()
        if "position" in payload and payload["position"]:
            validate_string(payload["position"], "position")
            update_doc["position"] = payload["position"].strip()
        if "cinema" in payload and payload["cinema"]:
            validate_string(payload["cinema"], "cinema")
            update_doc["cinema"] = payload["cinema"].strip()
        if "shift" in payload and payload["shift"]:
            validate_string(payload["shift"], "shift")
            update_doc["shift"] = payload["shift"].strip()
        if "status" in payload and payload["status"]:
            status = payload["status"].strip().lower()
            if status not in {"active", "inactive", "locked"}:
                raise ApiError("Invalid status", 400)
            update_doc["status"] = status

        if not update_doc:
            raise ApiError("No valid fields to update", 400)

        self.auth_repo.update_user(user_obj_id, update_doc)
        updated = self.auth_repo.get_user_by_id(user_obj_id)
        return {
            "id": str(updated.get("_id")),
            "name": updated.get("fullName") or updated.get("username"),
            "email": updated.get("email") or "",
            "phone": updated.get("phoneNumber") or "",
            "position": updated.get("position", "Nhân viên bán vé"),
            "cinema": updated.get("cinema", "TNC"),
            "shift": updated.get("shift", "Sáng"),
            "status": updated.get("status", "active"),
            "role": updated.get("role"),
        }

    def delete_staff(self, user_id: str) -> dict:
        user_obj_id = parse_object_id(user_id, "userId")
        user = self.auth_repo.get_user_by_id(user_obj_id)
        if not user:
            raise ApiError("Staff not found", 404)
        role = (user.get("role") or "").upper()
        if role not in {"ADMIN", "QUANLY", "NHANVIEN"}:
            raise ApiError("User is not staff", 400)
        self.auth_repo.delete_user(user_obj_id)
        return {"deleted": True, "id": user_id}
