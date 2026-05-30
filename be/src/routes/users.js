const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const bookingService = require('../services/bookingService');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/users/profile (JWT required) - alias for /api/auth/profile
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile (JWT required)
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/profile (JWT required)
router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/tickets — all bookings of current user
router.get('/tickets', requireAuth, async (req, res, next) => {
  try {
    const result = await bookingService.getMyBookings(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Admin-only routes ─────────────────────────────────────────────────────

// GET /api/users (ADMIN only) — list all users
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role.toUpperCase();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({
      users: users.map(u => authService._toProfileDTO(u)),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/status (ADMIN only) — toggle user active status
router.put('/:id/status', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true }
    );
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    res.json(authService._toProfileDTO(user));
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id (ADMIN only) — update any user
router.patch('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
