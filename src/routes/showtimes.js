const express = require('express');
const router = express.Router();
const showtimeService = require('../services/showtimeService');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/showtimes?movieId=&cinemaId=&roomId=&date=
router.get('/', async (req, res, next) => {
  try {
    const { movieId, cinemaId, roomId, date } = req.query;
    const result = await showtimeService.listShowtimes(movieId, cinemaId, roomId, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/showtimes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await showtimeService.getShowtimeById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/showtimes (ADMIN, NHANVIEN)
router.post('/', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const result = await showtimeService.createShowtime(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/showtimes/:id (ADMIN, NHANVIEN)
router.patch('/:id', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const result = await showtimeService.updateShowtime(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
