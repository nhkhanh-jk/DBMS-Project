const { normalize } = require('../utils/legacyNormalizer');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const User = require('../models/User');

class ReviewService {
  async listReviewsByMovie(movieId) {
    // Validate movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Get reviews for this movie
    const reviews = await Review.findAll({
      where: { movieId },
      order: [['reviewedAt', 'DESC']]
    });

    // Convert to DTOs
    return reviews.map(review => this._toReviewDTO(review));
  }

  async createReview(payload, currentUser) {
    // Normalize the payload (convert VI keys to EN keys)
    const normalized = normalize(payload, 'review');

    // Extract fields
    const { movieId, rating, comment } = normalized;

    // Validate required fields
    if (!movieId || rating === undefined || !comment) {
      const error = new Error('Missing required fields');
      error.status = 400;
      throw error;
    }

    // Validate movieId
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      const error = new Error('Rating must be an integer between 1 and 5');
      error.status = 400;
      throw error;
    }

    // Validate comment
    if (typeof comment !== 'string' || comment.trim() === '') {
      const error = new Error('Comment must be a non-empty string');
      error.status = 400;
      throw error;
    }

    // Validate user role (only KHACHHANG can create reviews)
    if (currentUser.role !== 'KHACHHANG') {
      const error = new Error('Only customers can create reviews');
      error.status = 403;
      throw error;
    }

    // Create review document
    const reviewData = {
      movieId,
      userId: currentUser.id,
      rating,
      comment,
      reviewedAt: new Date(),
    };

    // Create review
    const review = await Review.create(reviewData);

    // Return DTO
    return this._toReviewDTO(review);
  }

  // Helper method to convert review to DTO
  _toReviewDTO(review) {
    const r = review.get ? review.get({ plain: true }) : review;

    // Handle reviewedAt - convert to ISO string if it's a Date object
    let reviewedAt = r.reviewedAt;
    if (reviewedAt instanceof Date) {
      reviewedAt = reviewedAt.toISOString();
    }

    const idStr = r.id.toString();
    const movieIdStr = r.movieId.toString();
    const userIdStr = r.userId.toString();

    return {
      // English
      id: idStr,
      movieId: movieIdStr,
      userId: userIdStr,
      rating: r.rating,
      comment: r.comment,
      reviewedAt: reviewedAt,
      // Vietnamese
      MaPhim: movieIdStr,
      DiemSo: r.rating,
      BinhLuan: r.comment,
      MaND: userIdStr,
      ThoiGianDanhGia: reviewedAt,
    };
  }
}

module.exports = new ReviewService();
