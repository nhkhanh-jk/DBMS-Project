const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register-employee (ADMIN only)
router.post('/register-employee', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await authService.registerEmployee(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/profile (JWT required)
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/profile (JWT required)
router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/change-password (JWT required)
router.patch('/change-password', requireAuth, async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout (JWT required) - placeholder
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
