from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from cache.redis_client import init_redis
from config.settings import Config
from db.mongo import init_mongo
from routes import register_blueprints
from utils.errors import ApiError, error_response


def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ALLOWED_ORIGINS"]}},
        supports_credentials=False,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    init_mongo(app)
    init_redis(app)
    register_blueprints(app)
    register_error_handlers(app)
    return app


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return error_response(error.message, error.code)

    @app.errorhandler(404)
    def handle_not_found(_):
        return error_response("Resource not found", 404)

    @app.errorhandler(405)
    def handle_method_not_allowed(_):
        return error_response("Method not allowed", 405)

    @app.errorhandler(Exception)
    def handle_exception(error: Exception):
        app.logger.exception("Unhandled exception: %s", error)
        return error_response("Internal server error", 500)


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
