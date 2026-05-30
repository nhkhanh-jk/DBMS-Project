const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');
const { requireAuth } = require('../middleware/auth');

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

module.exports = router;
