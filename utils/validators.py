from typing import Any

from utils.errors import ApiError


def require_fields(data: dict[str, Any], fields: list[str]) -> None:
    missing = [field for field in fields if field not in data or data[field] in (None, "")]
    if missing:
        raise ApiError(f"Missing required fields: {', '.join(missing)}", 400)


def validate_string(value: Any, field_name: str, min_length: int = 1) -> None:
    if not isinstance(value, str) or len(value.strip()) < min_length:
        raise ApiError(f"{field_name} must be a non-empty string", 400)


def validate_int(value: Any, field_name: str, minimum: int | None = None) -> None:
    if not isinstance(value, int):
        raise ApiError(f"{field_name} must be an integer", 400)
    if minimum is not None and value < minimum:
        raise ApiError(f"{field_name} must be >= {minimum}", 400)


def validate_list(value: Any, field_name: str, min_items: int = 1) -> None:
    if not isinstance(value, list) or len(value) < min_items:
        raise ApiError(f"{field_name} must be a list with at least {min_items} item(s)", 400)

