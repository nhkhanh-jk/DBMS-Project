const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');
const { requireAuth, requireRole } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const User = require('../models/User');

// GET /api/bookings/me — lấy tất cả booking của user hiện tại
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await bookingService.getMyBookings(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings (JWT required)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const result = await bookingService.createBooking(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id (JWT required)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await bookingService.getBookingById(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/verify/:code — Nhân viên/Admin tra cứu vé theo bookingCode
router.get('/verify/:code', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const booking = await Booking.findOne({ where: { bookingCode: code } });
    if (!booking) {
      return res.status(404).json({ error: 'Không tìm thấy vé với mã này', code, status: 'invalid' });
    }

    // Lấy thêm thông tin showtime, movie, cinema
    const showtime = await Showtime.findByPk(booking.showtimeId);
    const movie    = showtime ? await Movie.findByPk(showtime.movieId)   : null;
    const cinema   = showtime ? await Cinema.findByPk(showtime.cinemaId) : null;
    const customer = await User.findByPk(booking.userId, { attributes: ['fullName', 'email', 'phoneNumber'] });

    // Kiểm tra trạng thái vé: nếu tất cả tickets đều CONFIRMED → valid, có USED → used
    const tickets = booking.tickets || [];
    const seatTickets = tickets.filter(t => !t.seatNumber?.startsWith('COMBO-'));
    const anyUsed = seatTickets.some(t => t.status === 'USED');
    const ticketStatus = anyUsed ? 'used' : 'valid';

    res.json({
      code,
      status: ticketStatus,
      bookingCode: booking.bookingCode,
      bookingId:   booking.id,
      totalPrice:  booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      bookingTime: booking.bookingTime,
      movie:   movie?.title || null,
      movieId: movie?.id || null,
      posterUrl: movie?.posterUrl || null,
      cinema:  cinema?.name || null,
      city:    cinema?.city || null,
      roomId:  showtime?.roomId || null,
      startTime: showtime?.startTime || null,
      endTime:   showtime?.endTime || null,
      seats: seatTickets.map(t => t.seatNumber).join(', '),
      combos: tickets.filter(t => t.seatNumber?.startsWith('COMBO-')).map(t => t.seatNumber.replace('COMBO-', '')),
      customer: customer?.fullName || null,
      customerEmail: customer?.email || null,
      customerPhone: customer?.phoneNumber || null,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/verify/:code/use — Đánh dấu vé đã dùng
router.put('/verify/:code/use', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const booking = await Booking.findOne({ where: { bookingCode: code } });
    if (!booking) {
      return res.status(404).json({ error: 'Không tìm thấy vé', status: 'invalid' });
    }
    const updatedTickets = (booking.tickets || []).map(t =>
      t.seatNumber?.startsWith('COMBO-') ? t : { ...t, status: 'USED' }
    );
    await booking.update({ tickets: updatedTickets });
    res.json({ success: true, code, status: 'used' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
