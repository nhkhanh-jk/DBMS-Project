const express = require('express');
const router = express.Router();
const seatService = require('../services/seatService');
const { requireAuth } = require('../middleware/auth');

// GET /api/seats/showtime/:showtimeId
router.get('/showtime/:showtimeId', requireAuth, async (req, res, next) => {
  try {
    const result = await seatService.listSeatsByShowtime(req.params.showtimeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
