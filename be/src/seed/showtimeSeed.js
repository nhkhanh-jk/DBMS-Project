const { faker } = require('@faker-js/faker');
const Showtime = require('../models/Showtime');

const SHOWTIME_COUNT = 300;

function buildShowtime(movie, cinema) {
  const room = faker.helpers.arrayElement(cinema.rooms || []);
  const startTime = faker.date.between({
    from: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  startTime.setHours(faker.helpers.arrayElement([9, 11, 13, 15, 17, 19, 21, 23]));
  startTime.setMinutes(faker.helpers.arrayElement([0, 15, 30, 45]));
  startTime.setSeconds(0, 0);

  const endTime = new Date(startTime.getTime() + movie.durationMin * 60 * 1000);

  return {
    movieId: movie.id,
    cinemaId: cinema.id,
    roomId: room.roomNumber,
    startTime,
    endTime,
    basePrice: faker.helpers.arrayElement([70000, 80000, 90000, 100000, 120000]),
    status: endTime < new Date() ? 'COMPLETED' : faker.helpers.arrayElement(['SCHEDULED', 'ACTIVE']),
    bookedSeats: [],
  };
}

async function seedShowtimes(movies, cinemas) {
  const showtimes = Array.from({ length: SHOWTIME_COUNT }, () => {
    const movie = faker.helpers.arrayElement(movies);
    const cinema = faker.helpers.arrayElement(cinemas);
    return buildShowtime(movie, cinema);
  });

  return Showtime.bulkCreate(showtimes);
}

module.exports = seedShowtimes;
