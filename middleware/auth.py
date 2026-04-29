from functools import wraps

from flask import g, request

from utils.errors import ApiError
from utils.security import decode_access_token


def jwt_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise ApiError("Missing bearer token", 401)
        token = auth_header.split(" ", 1)[1].strip()
        payload = decode_access_token(token)
        g.current_user = {"userId": payload["sub"], "role": payload["role"]}
        return func(*args, **kwargs)

    return wrapper


def roles_required(*roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_user = getattr(g, "current_user", None)
            if current_user is None:
                raise ApiError("Authentication required", 401)
            current_role = (current_user["role"] or "").upper()
            allowed_roles = {role.upper() for role in roles}
            if current_role not in allowed_roles:
                raise ApiError("Forbidden", 403)
            return func(*args, **kwargs)

        return wrapper

    return decorator
