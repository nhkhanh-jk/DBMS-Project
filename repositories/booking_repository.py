from bson import ObjectId

from repositories.base_repository import BaseRepository


class BookingRepository:
    def __init__(self):
        self.bookings = BaseRepository("bookings")

    def create_booking(self, booking_doc: dict):
        return self.bookings.insert_one(booking_doc)

    def get_booking(self, booking_id: ObjectId) -> dict | None:
        return self.bookings.find_one({"_id": booking_id})

    def get_booking_by_code(self, booking_code: str) -> dict | None:
        return self.bookings.find_one({"bookingCode": booking_code})

    def list_bookings_by_user(self, user_id: ObjectId) -> list[dict]:
        return self.bookings.find_many({"userId": user_id}, sort=[("bookingTime", -1)])

    def list_bookings(self) -> list[dict]:
        return self.bookings.find_many(sort=[("bookingTime", -1)])

    def mark_tickets_as_used(self, booking_id: ObjectId) -> int:
        result = self.bookings.collection.update_one(
            {"_id": booking_id},
            {"$set": {"tickets.$[ticket].status": "DA_SU_DUNG"}},
            array_filters=[{"ticket.status": {"$ne": "DA_SU_DUNG"}}],
        )
        return result.modified_count

    def list_booked_seat_numbers_by_showtime(self, showtime_id: ObjectId) -> set[str]:
        booking_docs = self.bookings.find_many({"showtimeId": showtime_id})
        booked: set[str] = set()
        for booking in booking_docs:
            for ticket in booking.get("tickets", []):
                seat_number = ticket.get("seatNumber")
                if seat_number:
                    booked.add(seat_number)
        return booked
