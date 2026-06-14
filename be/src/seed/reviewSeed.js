const { faker } = require('@faker-js/faker');
const Review = require('../models/Review');

const REVIEW_RATE_BY_CUSTOMER = 0.18;
const MIN_REVIEW_COUNT = 700;
const MAX_REVIEW_COUNT = 1200;

const reviewComments = [
  'Phong chieu sach, am thanh tot, dat ve nhanh.',
  'Nhan vien ho tro tot, trai nghiem on dinh.',
  'Suat chieu dung gio, ghe ngoi thoai mai.',
  'Man hinh dep, gia ve hop ly so voi chat luong.',
  'Khu vuc check-in hoi dong nhung xu ly nhanh.',
  'Do an ngon, can them nhieu quay lay ve vao cuoi tuan.',
  'Phong VIP yen tinh, phu hop xem phim toi.',
  'Am thanh lon vua phai, khong bi tre trailer.',
  'Dat ve online de dung, thanh toan nhanh.',
  'Rap dong vao gio cao diem nhung van sap xep tot.',
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function weighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = faker.number.float({ min: 0, max: total });

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }

  return items[items.length - 1].value;
}

function rating() {
  return weighted([
    { weight: 8, value: 5 },
    { weight: 46, value: 4 },
    { weight: 30, value: 3 },
    { weight: 12, value: 2 },
    { weight: 4, value: 1 },
  ]);
}

async function seedReviews(customers, movies) {
  const reviewCount = clamp(
    Math.round(customers.length * REVIEW_RATE_BY_CUSTOMER),
    MIN_REVIEW_COUNT,
    MAX_REVIEW_COUNT,
  );

  const reviewers = faker.helpers.shuffle(customers).slice(0, reviewCount);
  const reviews = reviewers.map(customer => ({
    movieId: faker.helpers.arrayElement(movies).id,
    userId: customer.id,
    rating: rating(),
    comment: faker.helpers.arrayElement(reviewComments),
    reviewedAt: faker.date.recent({ days: 90 }),
  }));

  return Review.bulkCreate(reviews);
}

module.exports = seedReviews;
