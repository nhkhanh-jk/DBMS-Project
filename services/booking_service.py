from uuid import uuid4

from bson import ObjectId

from repositories.auth_repository import AuthRepository
from repositories.booking_repository import BookingRepository
from repositories.cinema_repository import CinemaRepository
from repositories.customer_repository import CustomerRepository
from repositories.movie_repository import MovieRepository
from repositories.seat_repository import SeatRepository
from repositories.showtime_repository import ShowtimeRepository
from utils.datetime_utils import now_utc, to_iso
from utils.dto_mappers import to_booking_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id
from utils.validators import require_fields, validate_int, validate_list, validate_string
from workers.tasks import calculate_loyalty_points, send_booking_confirmation


class BookingService:
    def __init__(self):
        self.auth_repo = AuthRepository()
        self.booking_repo = BookingRepository()
        self.seat_repo = SeatRepository()
        self.showtime_repo = ShowtimeRepository()
        self.customer_repo = CustomerRepository()
        self.movie_repo = MovieRepository()
        self.cinema_repo = CinemaRepository()

    def create_booking(self, payload: dict, current_user: dict) -> dict:
        # Frontend compatibility: supports legacy keys MaSuat/DanhSachVe + MaGhe/GiaVe.
        showtime_id_raw = payload.get("showtimeId", payload.get("MaSuat"))
        ticket_entries = payload.get("tickets", payload.get("DanhSachVe"))
        if ticket_entries is None and isinstance(payload.get("seats"), list):
            ticket_entries = [{"seatNumber": seat} for seat in payload["seats"]]
        require_fields({"showtimeId": showtime_id_raw, "tickets": ticket_entries}, ["showtimeId", "tickets"])
        validate_string(showtime_id_raw, "showtimeId")
        validate_list(ticket_entries, "tickets", min_items=1)

        showtime_id = parse_object_id(showtime_id_raw, "showtimeId")
        showtime = self.showtime_repo.get_showtime(showtime_id)
        if not showtime:
            raise ApiError("Showtime not found", 404)

        user_id, staff_id = self._resolve_actor_ids(current_user, payload)
        promotion_code = payload.get("promotionCode")

        room = self.seat_repo.get_room(showtime["cinemaId"], showtime["roomId"])
        if not room:
            raise ApiError("Room not found", 404)
        valid_seat_numbers = {seat["seatNumber"] for seat in room.get("seats", [])}
        booked_seat_numbers = self.booking_repo.list_booked_seat_numbers_by_showtime(showtime_id)
        booked_seat_numbers.update(showtime.get("bookedSeats", []))
        tickets: list[dict] = []
        total_price = 0
        input_seat_numbers: set[str] = set()

        for entry in ticket_entries:
            seat_number = entry.get("seatNumber", entry.get("MaGhe"))
            require_fields({"seatNumber": seat_number}, ["seatNumber"])
            validate_string(seat_number, "seatNumber")
            if seat_number not in valid_seat_numbers:
                raise ApiError(f"Seat {seat_number} does not belong to showtime room", 400)
            if seat_number in booked_seat_numbers:
                raise ApiError(f"Seat {seat_number} is already booked", 409)
            if seat_number in input_seat_numbers:
                raise ApiError(f"Seat {seat_number} is duplicated in request", 400)
            input_seat_numbers.add(seat_number)

            ticket_price = entry.get("price", entry.get("GiaVe", showtime.get("basePrice", 0)))
            validate_int(ticket_price, "price", minimum=0)

            ticket_doc = {
                "seatNumber": seat_number,
                "price": ticket_price,
                "status": entry.get("status", "CHUA_SU_DUNG"),
            }
            tickets.append(ticket_doc)
            total_price += ticket_price

        booking_doc = {
            "bookingCode": f"BK-{uuid4().hex[:10].upper()}",
            "userId": user_id,
            "staffId": staff_id,
            "showtimeId": showtime_id,
            "bookingTime": now_utc(),
            "paymentMethod": payload.get("paymentMethod"),
            "promotionCode": promotion_code,
            "totalPrice": payload.get("totalPrice", payload.get("TongTien", total_price)),
            "tickets": tickets,
        }
        validate_int(booking_doc["totalPrice"], "totalPrice", minimum=0)

        result = self.booking_repo.create_booking(booking_doc)
        self.showtime_repo.add_booked_seats(showtime_id, list(input_seat_numbers))

        customer = self.customer_repo.get_customer_by_id(user_id)
        if customer:
            send_booking_confirmation.delay(
                customer.get("email"),
                {
                    "bookingCode": booking_doc["bookingCode"],
                    "totalPrice": booking_doc["totalPrice"],
                    "showtimeId": str(showtime_id),
                },
            )
            calculate_loyalty_points.delay(str(user_id), booking_doc["totalPrice"])

        created = self.booking_repo.get_booking(result.inserted_id)
        return to_booking_dto(created)

    def get_booking(self, booking_id: str) -> dict:
        booking = self.booking_repo.get_booking(parse_object_id(booking_id, "bookingId"))
        if not booking:
            raise ApiError("Booking not found", 404)
        return to_booking_dto(booking)

    def list_my_bookings(self, current_user: dict, status: str | None = None) -> list[dict]:
        user_id = parse_object_id(current_user["userId"], "userId")
        docs = self.booking_repo.list_bookings_by_user(user_id)
        result: list[dict] = []
        for booking in docs:
            summary = self._to_booking_summary(booking)
            summary.pop("_showtimeEndAt", None)
            summary["ticketState"] = "ACTIVE"
            result.append(summary)
        return result

    def get_booking_by_code(self, booking_code: str) -> dict:
        normalized = booking_code.strip().upper()
        if not normalized:
            raise ApiError("bookingCode is required", 400)
        booking = self.booking_repo.get_booking_by_code(normalized)
        if not booking:
            raise ApiError("Booking not found", 404)
        summary = self._to_booking_summary(booking)
        summary.pop("_showtimeEndAt", None)
        statuses = {(ticket.get("status") or "").upper() for ticket in booking.get("tickets", [])}
        is_used = bool(statuses) and statuses <= {"DA_SU_DUNG"}
        summary["scanStatus"] = "used" if is_used else "valid"
        return summary

    def consume_booking(self, booking_id: str) -> dict:
        booking_obj_id = parse_object_id(booking_id, "bookingId")
        booking = self.booking_repo.get_booking(booking_obj_id)
        if not booking:
            raise ApiError("Booking not found", 404)
        self.booking_repo.mark_tickets_as_used(booking_obj_id)
        updated = self.booking_repo.get_booking(booking_obj_id)
        if not updated:
            raise ApiError("Booking not found", 404)
        summary = self._to_booking_summary(updated)
        summary.pop("_showtimeEndAt", None)
        summary["scanStatus"] = "used"
        return summary

    def check_and_consume_ticket_code(self, ticket_code: str) -> dict:
        summary = self.get_booking_by_code(ticket_code)
        already_used = summary.get("scanStatus") == "used"
        if already_used:
            return {
                "ticketCode": summary.get("bookingCode"),
                "isValid": False,
                "message": "Ticket already used",
                "booking": summary,
            }
        consumed = self.consume_booking(summary["id"])
        return {
            "ticketCode": consumed.get("bookingCode"),
            "isValid": True,
            "message": "Ticket is valid and marked as used",
            "booking": consumed,
        }

    def _resolve_actor_ids(self, current_user: dict, payload: dict) -> tuple[ObjectId, ObjectId | None]:
        current_user_id = parse_object_id(current_user["userId"], "userId")
        role = (current_user["role"] or "").upper()

        if role == "KHACHHANG":
            return current_user_id, None

        legacy_customer_id = payload.get("MaKH")
        customer_id_raw = payload.get("userId", legacy_customer_id)
        if not customer_id_raw:
            # Internal staff sell-ticket flow can default to self when no customer is attached.
            return current_user_id, current_user_id
        validate_string(customer_id_raw, "userId")
        customer_user_id = parse_object_id(customer_id_raw, "userId")
        customer = self.customer_repo.get_customer_by_id(customer_user_id)
        if not customer:
            raise ApiError("Customer not found", 404)
        return customer_user_id, current_user_id

    def _to_booking_summary(self, booking: dict) -> dict:
        showtime = self.showtime_repo.get_showtime(booking["showtimeId"]) if booking.get("showtimeId") else None
        movie = self.movie_repo.get_movie(showtime["movieId"]) if showtime and showtime.get("movieId") else None

        room_name = None
        cinema_name = None
        if showtime and showtime.get("cinemaId") and showtime.get("roomId"):
            for cinema in self.cinema_repo.list_cinemas():
                if cinema.get("_id") == showtime["cinemaId"]:
                    cinema_name = cinema.get("name")
                    for room in cinema.get("rooms", []):
                        if room.get("_id") == showtime["roomId"]:
                            room_name = room.get("name")
                            break
                    break

        tickets = booking.get("tickets", [])
        seat_numbers = [ticket.get("seatNumber") for ticket in tickets if ticket.get("seatNumber")]
        start_time = showtime.get("startTime") if showtime else None
        end_time = showtime.get("endTime") if showtime else None
        return {
            "id": str(booking.get("_id")),
            "bookingCode": booking.get("bookingCode"),
            "movieTitle": movie.get("title") if movie else "N/A",
            "movieRating": movie.get("rating", "P") if movie else "P",
            "poster": movie.get("image") if movie else None,
            "cinemaName": cinema_name or "N/A",
            "roomName": room_name or "N/A",
            "showtimeStartTime": to_iso(start_time) if start_time else None,
            "showtimeEndTime": to_iso(end_time) if end_time else None,
            "_showtimeEndAt": end_time,
            "bookingTime": to_iso(booking.get("bookingTime")) if booking.get("bookingTime") else None,
            "seatNumbers": seat_numbers,
            "totalPrice": booking.get("totalPrice", 0),
            "tickets": tickets,
            "MaDatVe": booking.get("bookingCode"),
            "MaDon": str(booking.get("_id")),
            "TenPhim": movie.get("title") if movie else "N/A",
            "TenRap": cinema_name or "N/A",
            "TenPhong": room_name or "N/A",
            "GheNgoi": ", ".join(seat_numbers),
            "TongTien": booking.get("totalPrice", 0),
            "ThoiGianChieu": to_iso(start_time) if start_time else None,
        }
