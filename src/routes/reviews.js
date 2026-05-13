const express = require('express');
const router = express.Router();
const reviewService = require('../services/reviewService');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/reviews/movie/:movieId
router.get('/movie/:movieId', async (req, res, next) => {
  try {
    const result = await reviewService.listReviewsByMovie(req.params.movieId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews (KHACHHANG only)
router.post('/', requireAuth, requireRole('KHACHHANG'), async (req, res, next) => {
  try {
    const result = await reviewService.createReview(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
