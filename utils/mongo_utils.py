from bson import ObjectId
from bson.errors import InvalidId

from utils.errors import ApiError


def parse_object_id(value: str, field_name: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise ApiError(f"{field_name} must be a valid ObjectId", 400) from exc
