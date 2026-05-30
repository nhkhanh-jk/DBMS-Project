const express = require('express');
const router = express.Router();
const cinemaService = require('../services/cinemaService');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/cinemas — public
router.get('/', async (req, res, next) => {
  try {
    const result = await cinemaService.listCinemas();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/cinemas/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const result = await cinemaService.getCinemaById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/cinemas (ADMIN only)
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await cinemaService.createCinema(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cinemas/:id (ADMIN only)
router.patch('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await cinemaService.updateCinema(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cinemas/:id (ADMIN only)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = await cinemaService.deleteCinema(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
