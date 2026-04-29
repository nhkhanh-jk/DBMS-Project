import redis
from flask import Flask

redis_client: redis.Redis | None = None


def init_redis(app: Flask) -> None:
    global redis_client
    redis_client = redis.Redis.from_url(app.config["REDIS_URL"], decode_responses=True)


def get_redis() -> redis.Redis:
    if redis_client is None:
        raise RuntimeError("Redis is not initialized")
    return redis_client

