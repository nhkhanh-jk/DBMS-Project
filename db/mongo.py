from flask import Flask
from pymongo import MongoClient
from pymongo.database import Database

mongo_client: MongoClient | None = None
mongo_db: Database | None = None


def init_mongo(app: Flask) -> None:
    global mongo_client, mongo_db
    mongo_client = MongoClient(app.config["MONGO_URI"])
    mongo_db = mongo_client[app.config["MONGO_DB_NAME"]]


def get_db() -> Database:
    if mongo_db is None:
        raise RuntimeError("MongoDB is not initialized")
    return mongo_db

