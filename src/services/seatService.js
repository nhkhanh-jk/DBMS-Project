const Showtime = require('../models/Showtime');

class SeatService {
  async listSeatsByShowtime(showtimeId) {
    // Validate showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    // For now, return a simplified seat list
    // In a real implementation, we would:
    // 1. Get the cinema/hall layout for this showtime
    // 2. Generate all seats for that hall
    // 3. Mark which seats are already booked
    
    // Simplified response - assuming a standard hall with 10 rows and 10 seats per row
    const seats = [];
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 10; seat++) {
        const seatNumber = `${String.fromCharCode(64 + row)}${seat}`; // A1, A2, ..., J10
        // Check if this seat is booked (simplified)
        const isBooked = showtime.bookedSeats.some(
          bookedSeat => bookedSeat.seatNumber === seatNumber
        );
        
        seats.push({
          seatNumber,
          price: 100000, // Fixed price for demo - in reality would vary by seat type
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
