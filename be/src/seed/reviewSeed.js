const { faker } = require('@faker-js/faker');
const Review = require('../models/Review');

const REVIEW_COUNT = 500;

async function seedReviews(customers, movies) {
  const reviews = Array.from({ length: REVIEW_COUNT }, () => ({
    movieId: faker.helpers.arrayElement(movies).id,
    userId: faker.helpers.arrayElement(customers).id,
    rating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.sentence(),
    reviewedAt: faker.date.recent({ days: 90 }),
  }));

  return Review.bulkCreate(reviews);
}

module.exports = seedReviews;
