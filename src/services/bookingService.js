const { normalize } = require('../utils/legacyNormalizer');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');

class BookingService {
  async createBooking(payload, currentUser) {
    // Normalize the payload (convert VI keys to EN keys)
    const normalized = normalize(payload, 'booking');

    // Extract fields
    const {
      showtimeId,
      paymentMethod,
      promotionCode,
      tickets
    } = normalized;

    // Validate required fields
    if (!showtimeId || !paymentMethod || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }

    // Validate showtimeId
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    // Validate user role - KHACHHANG can only book for themselves
    // ADMIN/NHANVIEN can book for any user
    let userId = currentUser.id;
    if (currentUser.role !== 'KHACHHANG' && normalized.userId) {
      // Staff/Admin can specify a different user
      userId = normalized.userId;
      
      // Validate that the user exists
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }
    }

    // Validate tickets
    for (const ticket of tickets) {
      if (!ticket.seatNumber || !ticket.price) {
        const error = new Error('Each ticket must have seatNumber and price');
        error.status = 400;
        throw error;
      }
    }

    // Calculate total price
    const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Generate booking code (simplified - in reality would be more complex)
    const bookingCode = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create booking document
    const bookingData = {
      bookingCode,
      userId,
      showtimeId,
      paymentMethod,
      promotionCode: promotionCode || null,
      totalPrice,
      tickets: tickets.map(ticket => ({
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        status: 'CONFIRMED', // All tickets start as confirmed
      })),
      bookingTime: new Date(),
    };

    // Create booking
    const booking = await Booking.create(bookingData);

    // TODO: Add logic to update showtime bookedSeats
    // For now, we'll just return the booking

    // Return DTO
    return this._toBookingDTO(booking);
  }

  async getBookingById(bookingId, currentUser) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.status = 404;
      throw error;
    }

    // Authorization: Users can only see their own bookings unless they're staff
    if (currentUser.role === 'KHACHHANG' && booking.userId.toString() !== currentUser.id) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }

    return this._toBookingDTO(booking);
  }

  // Helper method to convert booking to DTO (matches Python's to_booking_dto)
  _toBookingDTO(booking) {
    const b = booking.toObject ? booking.toObject() : booking;

    // Convert tickets array to proper format
    const tickets = (b.tickets || []).map(ticket => ({
      seatNumber: ticket.seatNumber,
      price: ticket.price,
      status: ticket.status,
      MaGhe: ticket.seatNumber,
      GiaVe: ticket.price,
      TrangThai: ticket.status,
    }));

    return {
      // English
      id: b._id.toString(),
      bookingCode: b.bookingCode,
      userId: b.userId.toString(),
      staffId: b.staffId ? b.staffId.toString() : null,
      showtimeId: b.showtimeId.toString(),
      bookingTime: b.bookingTime.toISOString(),
      paymentMethod: b.paymentMethod,
      promotionCode: b.promotionCode,
      totalPrice: b.totalPrice,
      tickets: tickets,
      // Vietnamese
      MaDon: b._id.toString(),
      MaDatVe: b.bookingCode,
      MaKH: b.userId.toString(),
      MaNV: b.staffId ? b.staffId.toString() : null,
      MaSuat: b.showtimeId.toString(),
      ThoiGianDat: b.bookingTime.toISOString(),
      TongTien: b.totalPrice,
      DanhSachVe: tickets,
    };
  }
}

module.exports = new BookingService();
