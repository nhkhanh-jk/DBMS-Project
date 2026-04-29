from datetime import UTC, datetime

from utils.errors import ApiError


def now_utc() -> datetime:
    return datetime.now(UTC)


def parse_iso_datetime(value: str, field_name: str) -> datetime:
    try:
        normalized = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt.astimezone(UTC)
    except ValueError as exc:
        raise ApiError(f"{field_name} must be ISO-8601 datetime", 400) from exc


def to_iso(dt: datetime) -> str:
    return dt.astimezone(UTC).isoformat()

