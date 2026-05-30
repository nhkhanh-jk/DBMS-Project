const Showtime = require('../models/Showtime');

class SeatService {
  async listSeatsByShowtime(showtimeId) {
    // Validate showtime exists
    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    // Simplified response - assuming a standard hall with 10 rows and 10 seats per row
    const seats = [];
    const bookedSeats = showtime.bookedSeats || [];
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 10; seat++) {
        const seatNumber = `${String.fromCharCode(64 + row)}${seat}`; // A1, A2, ..., J10
        // Check if this seat is booked
        const isBooked = bookedSeats.some(
          bookedSeat => bookedSeat.seatNumber === seatNumber
        );
        
        seats.push({
          seatNumber,
          price: 100000, // Fixed price for demo
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          MaGhe: seatNumber,
          GiaVe: 100000,
          TrangThai: isBooked ? 'ĐÃ BÁN' : 'CÒN TRỐNG',
        });
      }
    }
    
    return seats;
  }
}

module.exports = new SeatService();
