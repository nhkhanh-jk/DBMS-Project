const { normalize } = require('../utils/legacyNormalizer');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');

class BookingService {
  async createBooking(payload, currentUser) {
    const normalized = normalize(payload, 'booking');

    const {
      showtimeId,
      paymentMethod,
      promotionCode,
    } = normalized;

    // Support both `tickets: [{seatNumber, price}]` and `seats: ["A1","A2"]` formats
    let tickets = normalized.tickets;
    if (!tickets && normalized.seats && Array.isArray(normalized.seats)) {
      const showtime = await Showtime.findByPk(showtimeId);
      if (!showtime) {
        const error = new Error('Showtime not found');
        error.status = 404;
        throw error;
      }
      tickets = normalized.seats.map(seatNumber => ({
        seatNumber,
        price: showtime.basePrice || 100000,
      }));
    }

    if (!showtimeId || !paymentMethod || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      const error = new Error('Missing required fields: showtimeId, paymentMethod, tickets/seats');
      error.status = 400;
      throw error;
    }

    const showtime = await Showtime.findByPk(showtimeId);
    if (!showtime) {
      const error = new Error('Showtime not found');
      error.status = 404;
      throw error;
    }

    if (['COMPLETED', 'CANCELLED'].includes(showtime.status)) {
      const error = new Error('Cannot book a showtime that is completed or cancelled');
      error.status = 400;
      throw error;
    }

    // Determine userId based on role
    let userId = currentUser.id;
    if (currentUser.role !== 'KHACHHANG' && normalized.userId) {
      userId = normalized.userId;
      const user = await User.findByPk(userId);
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }
    }

    // Validate each ticket
    for (const ticket of tickets) {
      if (!ticket.seatNumber || ticket.price === undefined) {
        const error = new Error('Each ticket must have seatNumber and price');
        error.status = 400;
        throw error;
      }
    }

    // Check seats are not already booked (bỏ qua combo items)
    const alreadyBooked = (showtime.bookedSeats || []).map(bs => bs.seatNumber);
    const requestedSeats = tickets
      .filter(t => !t.seatNumber?.startsWith('COMBO-'))
      .map(t => t.seatNumber);
    const conflicts = requestedSeats.filter(s => alreadyBooked.includes(s));
    if (conflicts.length > 0) {
      const error = new Error(`Seats already booked: ${conflicts.join(', ')}`);
      error.status = 409;
      throw error;
    }

    const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

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
        status: 'CONFIRMED',
        type: ticket.type || 'seat',
      })),
      bookingTime: new Date(),
    };

    // If staff/admin is booking, record staffId
    if (currentUser.role !== 'KHACHHANG') {
      bookingData.staffId = currentUser.id;
    }

    const booking = await Booking.create(bookingData);

    // Chỉ cập nhật bookedSeats cho ghế thật (không cập nhật combo)
    const newBookedSeats = tickets
      .filter(t => !t.seatNumber?.startsWith('COMBO-'))
      .map(t => ({ seatNumber: t.seatNumber, status: 'BOOKED' }));
    const updatedBookedSeats = [...(showtime.bookedSeats || []), ...newBookedSeats];
    await showtime.update({ bookedSeats: updatedBookedSeats });

    return this._toBookingDTO(booking);
  }

  async getBookingById(bookingId, currentUser) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.status = 404;
      throw error;
    }
    if (currentUser.role === 'KHACHHANG' && booking.userId.toString() !== currentUser.id) {
      const error = new Error('Access denied');
      error.status = 403;
      throw error;
    }
    return this._toBookingDTO(booking);
  }

  async getMyBookings(userId) {
    const bookings = await Booking.findAll({
      where: { userId },
      order: [['bookingTime', 'DESC']]
    });
    return bookings.map(b => this._toBookingDTO(b));
  }

  _toBookingDTO(booking) {
    const b = booking.get ? booking.get({ plain: true }) : booking;

    const tickets = (b.tickets || []).map(ticket => ({
      seatNumber: ticket.seatNumber,
      price: ticket.price,
      status: ticket.status,
      MaGhe: ticket.seatNumber,
      GiaVe: ticket.price,
      TrangThai: ticket.status,
    }));

    const idStr = b.id.toString();
    const userIdStr = b.userId.toString();
    const staffIdStr = b.staffId ? b.staffId.toString() : null;
    const showtimeIdStr = b.showtimeId.toString();

    let bookingTime = b.bookingTime;
    if (bookingTime instanceof Date) {
      bookingTime = bookingTime.toISOString();
    }

    return {
      // English
      id: idStr,
      bookingCode: b.bookingCode,
      userId: userIdStr,
      staffId: staffIdStr,
      showtimeId: showtimeIdStr,
      bookingTime: bookingTime,
      paymentMethod: b.paymentMethod,
      promotionCode: b.promotionCode,
      totalPrice: b.totalPrice,
      tickets,
      // Vietnamese
      MaDon: idStr,
      MaDatVe: b.bookingCode,
      MaKH: userIdStr,
      MaNV: staffIdStr,
      MaSuat: showtimeIdStr,
      ThoiGianDat: bookingTime,
      TongTien: b.totalPrice,
      DanhSachVe: tickets,
    };
  }
}

module.exports = new BookingService();
