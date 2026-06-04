require('dotenv').config();

const sequelize = require('../config/sequelize');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');

const seedUsers = require('./userFactory');
const seedMovies = require('./movieSeed');
const seedCinemas = require('./cinemaSeed');
const seedShowtimes = require('./showtimeSeed');
const seedBookings = require('./bookingSeed');
const seedReviews = require('./reviewSeed');
const seedServiceRequests = require('./serviceRequestSeed');

async function resetSeedData() {
  await Booking.destroy({ where: {} });
  await Review.destroy({ where: {} });
  await ServiceRequest.destroy({ where: {} });
  await Showtime.destroy({ where: {} });
  await Cinema.destroy({ where: {} });
  await Movie.destroy({ where: {} });
  await User.destroy({ where: {} });
}

async function seed() {
  const runId = Date.now().toString(36).toUpperCase();

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  if (process.env.SEED_RESET === 'true') {
    console.log('Resetting existing data...');
    await resetSeedData();
  }

  console.log('Creating users...');
  const users = await seedUsers(runId);
  const employees = users.filter(user => user.role === 'NHANVIEN' || user.role === 'ADMIN');
  const customers = users.filter(user => user.role === 'KHACHHANG');

  console.log('Creating movies...');
  const movies = await seedMovies();

  console.log('Creating cinemas...');
  const cinemas = await seedCinemas();
  const cinemasById = new Map(cinemas.map(cinema => [cinema.id, cinema]));

  console.log('Creating showtimes...');
  const showtimes = await seedShowtimes(movies, cinemas);

  console.log('Creating bookings...');
  const bookings = await seedBookings({ users, employees, showtimes, cinemasById, runId });

  console.log('Creating reviews...');
  const reviews = await seedReviews(customers, movies);

  console.log('Creating service requests...');
  const serviceRequests = await seedServiceRequests(customers);

  console.log('Seed completed');
  console.table({
    users: users.length,
    movies: movies.length,
    cinemas: cinemas.length,
    showtimes: showtimes.length,
    bookings: bookings.length,
    reviews: reviews.length,
    service_requests: serviceRequests.length,
  });

  await sequelize.close();
}

seed().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
