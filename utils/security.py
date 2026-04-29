from datetime import timedelta

import bcrypt
import jwt
from flask import current_app

from utils.datetime_utils import now_utc
from utils.errors import ApiError


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        # Dev/data-migration compatibility: allow legacy plain-text passwords.
        return password == hashed_password


def create_access_token(user_id: str, role: str) -> str:
    exp = now_utc() + timedelta(hours=current_app.config["JWT_EXPIRES_HOURS"])
    payload = {"sub": user_id, "role": role, "exp": exp}
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise ApiError("Token expired", 401) from exc
    except jwt.InvalidTokenError as exc:
        raise ApiError("Invalid token", 401) from exc
