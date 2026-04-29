from datetime import datetime


def _to_str(value):
    return str(value) if value is not None else None


def _to_iso(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _external_role(role: str | None) -> str:
    return (role or "").upper()


def to_movie_dto(movie: dict) -> dict:
    genres = movie.get("genres", [])
    genre = genres[0] if genres else ""
    duration = movie.get("durationMin")
    release_date = _to_iso(movie.get("releaseDate"))
    return {
        "id": _to_str(movie.get("_id")),
        "title": movie.get("title"),
        "genre": genre,
        "genres": genres,
        "description": movie.get("description"),
        "duration": duration,
        "durationMin": movie.get("durationMin"),
        "releaseDate": release_date,
        "status": movie.get("status"),
    }


def to_showtime_dto(showtime: dict) -> dict:
    showtime_id = _to_str(showtime.get("_id"))
    movie_id = _to_str(showtime.get("movieId"))
    room_id = _to_str(showtime.get("roomId"))
    movie_title = showtime.get("movieTitle")
    room_name = showtime.get("roomName")
    return {
        "id": showtime_id,
        "movieId": movie_id,
        "cinemaId": _to_str(showtime.get("cinemaId")),
        "roomId": room_id,
        "startTime": _to_iso(showtime.get("startTime")),
        "endTime": _to_iso(showtime.get("endTime")),
        "basePrice": showtime.get("basePrice"),
        "status": showtime.get("status"),
        "bookedSeats": showtime.get("bookedSeats", []),
        "movieTitle": movie_title,
        "roomName": room_name,
        "MaSuat": showtime_id,
        "MaPhim": movie_id,
        "MaPhong": room_id,
        "ThoiGianBatDau": _to_iso(showtime.get("startTime")),
        "ThoiGianKetThuc": _to_iso(showtime.get("endTime")),
        "TrangThai": showtime.get("status"),
        "TenPhim": movie_title,
        "TenPhong": room_name,
    }


def to_seat_dto(seat: dict, room_id: str, is_booked: bool = False) -> dict:
    seat_number = seat.get("seatNumber")
    seat_id = _to_str(seat.get("_id")) or seat_number
    seat_type = seat.get("type", "THUONG")
    return {
        "id": seat_id,
        "roomId": room_id,
        "seatNumber": seat_number,
        "row": seat.get("row"),
        "column": seat.get("column"),
        "seatType": seat_type,
        "isBooked": is_booked,
        "MaGhe": seat_id,
        "MaPhong": room_id,
        "SoGhe": seat_number,
        "LoaiGhe": seat_type,
    }


def to_review_dto(review: dict) -> dict:
    return {
        "id": _to_str(review.get("_id")),
        "movieId": _to_str(review.get("movieId")),
        "userId": _to_str(review.get("userId")),
        "rating": review.get("rating"),
        "comment": review.get("comment"),
        "reviewedAt": _to_iso(review.get("reviewedAt")),
    }


def to_service_request_dto(request_doc: dict) -> dict:
    return {
        "id": _to_str(request_doc.get("_id")),
        "userId": _to_str(request_doc.get("userId")),
        "requestType": request_doc.get("requestType"),
        "requestDetail": request_doc.get("requestDetail"),
        "status": request_doc.get("status"),
    }


def to_ticket_dto(ticket: dict) -> dict:
    seat_number = ticket.get("seatNumber")
    price = ticket.get("price")
    status = ticket.get("status")
    return {
        "seatNumber": seat_number,
        "price": price,
        "status": status,
        "MaGhe": seat_number,
        "GiaVe": price,
        "TrangThai": status,
    }


def to_booking_dto(booking: dict) -> dict:
    booking_id = _to_str(booking.get("_id"))
    showtime_id = _to_str(booking.get("showtimeId"))
    user_id = _to_str(booking.get("userId"))
    staff_id = _to_str(booking.get("staffId"))
    booking_time = _to_iso(booking.get("bookingTime"))
    total_price = booking.get("totalPrice")
    tickets = [to_ticket_dto(ticket) for ticket in booking.get("tickets", [])]
    return {
        "id": booking_id,
        "bookingCode": booking.get("bookingCode"),
        "userId": user_id,
        "staffId": staff_id,
        "showtimeId": showtime_id,
        "bookingTime": booking_time,
        "paymentMethod": booking.get("paymentMethod"),
        "promotionCode": booking.get("promotionCode"),
        "totalPrice": total_price,
        "tickets": tickets,
        "MaDon": booking_id,
        "MaDatVe": booking.get("bookingCode"),
        "MaKH": user_id,
        "MaNV": staff_id,
        "MaSuat": showtime_id,
        "ThoiGianDat": booking_time,
        "TongTien": total_price,
        "DanhSachVe": tickets,
    }


def to_profile_dto(user: dict) -> dict:
    role = _external_role(user.get("role"))
    base_profile = {
        "userId": _to_str(user.get("_id")),
        "username": user.get("username"),
        "role": role,
        "fullName": user.get("fullName"),
        "dateOfBirth": _to_iso(user.get("dateOfBirth")),
        "gender": user.get("gender"),
        "email": user.get("email"),
        "phoneNumber": user.get("phoneNumber"),
        "rewardPoints": user.get("rewardPoints", 0),
        "membershipLevel": user.get("membershipLevel", "bronze"),
        "VaiTro": role,
    }

    if role == "KHACHHANG":
        base_profile["customer"] = {
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "phone": user.get("phoneNumber"),
            "loyaltyPoints": user.get("rewardPoints", 0),
            "memberTier": user.get("membershipLevel", "bronze"),
        }
    else:
        base_profile["employee"] = {
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "phone": user.get("phoneNumber"),
            "position": role,
        }

    return base_profile
