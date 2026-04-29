from routes.admin_routes import admin_bp
from flask import Flask

from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.cinema_routes import cinema_bp
from routes.health_routes import health_bp
from routes.manager_routes import manager_bp
from routes.movie_routes import movie_bp
from routes.review_routes import review_bp
from routes.report_routes import report_bp
from routes.seat_routes import seat_bp
from routes.service_request_routes import service_request_bp
from routes.showtime_routes import showtime_bp
from routes.staff_routes import staff_bp
from routes.user_routes import user_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(movie_bp, url_prefix="/api/movies")
    app.register_blueprint(showtime_bp, url_prefix="/api/showtimes")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")
    app.register_blueprint(cinema_bp, url_prefix="/api/cinemas")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(manager_bp, url_prefix="/api/manager")
    app.register_blueprint(staff_bp, url_prefix="/api/staff")
    app.register_blueprint(seat_bp, url_prefix="/api/seats")
    app.register_blueprint(review_bp, url_prefix="/api/reviews")
    app.register_blueprint(report_bp, url_prefix="/api/reports")
    app.register_blueprint(service_request_bp, url_prefix="/api/service-requests")
