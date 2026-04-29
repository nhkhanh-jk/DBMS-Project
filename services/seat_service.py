from repositories.booking_repository import BookingRepository
from repositories.seat_repository import SeatRepository
from repositories.showtime_repository import ShowtimeRepository
from utils.dto_mappers import to_seat_dto
from utils.errors import ApiError
from utils.mongo_utils import parse_object_id


class SeatService:
    def __init__(self):
        self.seat_repo = SeatRepository()
        self.showtime_repo = ShowtimeRepository()
        self.booking_repo = BookingRepository()

    def list_seats_by_showtime(self, showtime_id: str) -> list[dict]:
        showtime_obj_id = parse_object_id(showtime_id, "showtimeId")
        showtime = self.showtime_repo.get_showtime(showtime_obj_id)
        if not showtime:
            raise ApiError("Showtime not found", 404)

        room = self.seat_repo.get_room(showtime["cinemaId"], showtime["roomId"])
        if not room:
            raise ApiError("Room not found", 404)

        seats = sorted(room.get("seats", []), key=lambda seat: (seat.get("row", ""), seat.get("column", 0)))
        booked_seat_numbers = self.booking_repo.list_booked_seat_numbers_by_showtime(showtime_obj_id)
        booked_seat_numbers.update(showtime.get("bookedSeats", []))
        
        base_price = showtime.get("basePrice", 0)
        result = []
        for seat in seats:
            seat_number = seat["seatNumber"]
            is_booked = seat_number in booked_seat_numbers
            
            # Simple status logic: if in maintenance db, return MAINTENANCE, else check booked.
            # For now, we assume all seats in room are active unless booked.
            status = "BOOKED" if is_booked else "AVAILABLE"
            if seat.get("status") == "MAINTENANCE":
                status = "MAINTENANCE"
                
            seat_type = seat.get("type", "NORMAL")
            # Calculate price based on type
            surcharge = 0
            if seat_type == "VIP":
                surcharge = 20000
            elif seat_type == "SWEETBOX":
                surcharge = 50000
                
            dto = to_seat_dto(seat, str(showtime["roomId"]), is_booked)
            dto.update({
                "status": status,
                "type": seat_type,
                "price": base_price + surcharge
            })
            result.append(dto)
        return result
