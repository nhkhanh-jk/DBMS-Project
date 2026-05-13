const express = require('express');
const router = express.Router();
const movieService = require('../services/movieService');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/movies?status=...
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await movieService.listMovies(status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await movieService.getMovieById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/movies (ADMIN, NHANVIEN)
router.post('/', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const result = await movieService.createMovie(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/movies/:id (ADMIN, NHANVIEN)
router.patch('/:id', requireAuth, requireRole('ADMIN', 'NHANVIEN'), async (req, res, next) => {
  try {
    const result = await movieService.updateMovie(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
