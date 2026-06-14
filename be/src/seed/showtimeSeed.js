const Showtime = require('../models/Showtime');

const DAYS_BEFORE = 10;
const DAYS_AFTER = 4;
const ROOM_SLOTS = {
  imax: [10, 13, 16, 19, 22],
  vip: [11, 14, 17, 20, 22],
  standard: [9, 12, 15, 18, 21],
};

function getMovieWeight(movie) {
  const genres = (movie.genres || []).join(' ').toLowerCase();
  const title = (movie.title || '').toLowerCase();

  if (movie.status === 'ACTIVE' || movie.status === 'RELEASED') return 1.2;
  if (genres.includes('action') || genres.includes('thriller')) return 1.16;
  if (genres.includes('horror')) return 1.1;
  if (genres.includes('family') || genres.includes('animation')) return 1.06;
  if (title.includes('2') || title.includes('3')) return 1.08;
  return 1;
}

function pickMovie(movies, seed) {
  const ranked = [...movies].sort((a, b) => getMovieWeight(b) - getMovieWeight(a));
  const pool = ranked.slice(0, Math.min(12, ranked.length));
  return pool[seed % pool.length] || ranked[0];
}

function priceFor({ room, hour, date }) {
  const weekend = [0, 6].includes(date.getDay());
  const evening = hour >= 18;
  const roomPremium = room.type === 'imax' ? 25000 : room.type === 'vip' ? 35000 : 0;
  const timePremium = weekend ? 15000 : evening ? 10000 : 0;
  return 75000 + roomPremium + timePremium;
}

function statusFor(startTime, endTime) {
  const now = new Date();
  if (endTime < now) return 'COMPLETED';
  if (startTime <= now && endTime >= now) return 'ACTIVE';
  return 'SCHEDULED';
}

function buildShowtime({ movie, cinema, room, date, hour, minute }) {
  const startTime = new Date(date);
  startTime.setHours(hour, minute, 0, 0);

  const cleanupMinutes = 20;
  const endTime = new Date(startTime.getTime() + (movie.durationMin + cleanupMinutes) * 60 * 1000);

  return {
    movieId: movie.id,
    cinemaId: cinema.id,
    roomId: room.roomNumber,
    startTime,
    endTime,
    basePrice: priceFor({ room, hour, date }),
    status: statusFor(startTime, endTime),
    bookedSeats: [],
  };
}

async function seedShowtimes(movies, cinemas) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const showtimes = [];

  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const weekend = [0, 6].includes(date.getDay());

    cinemas.forEach((cinema, cinemaIndex) => {
      (cinema.rooms || []).forEach((room, roomIndex) => {
        const slots = ROOM_SLOTS[room.type] || ROOM_SLOTS.standard;
        const dailySlotCount = weekend ? slots.length : Math.max(3, slots.length - 1);

        slots.slice(0, dailySlotCount).forEach((hour, slotIndex) => {
          const seed = cinemaIndex * 17 + roomIndex * 7 + slotIndex + offset * 3;
          const minute = [0, 10, 20, 30][Math.abs(seed) % 4];
          const movie = pickMovie(movies, Math.abs(seed));

          showtimes.push(buildShowtime({
            movie,
            cinema,
            room,
            date,
            hour,
            minute,
          }));
        });
      });
    });
  }

  return Showtime.bulkCreate(showtimes);
}

module.exports = seedShowtimes;
