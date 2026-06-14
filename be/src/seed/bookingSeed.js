const { faker } = require('@faker-js/faker');
const Booking = require('../models/Booking');

const CITY_DEMAND = {
  'TP. Ho Chi Minh': 1.18,
  'Ha Noi': 1.1,
  'Da Nang': 1.02,
  'Can Tho': 0.82,
  'Hai Phong': 0.78,
  'Nha Trang': 0.8,
};

function makeSeats(capacity) {
  const seats = [];
  const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seatsPerRow = 12;

  for (let index = 0; index < capacity; index += 1) {
    seats.push(`${rows[Math.floor(index / seatsPerRow)]}${(index % seatsPerRow) + 1}`);
  }

  return seats;
}

function roomFor(cinema, roomId) {
  return (cinema.rooms || []).find(item => item.roomNumber === roomId) || {
    roomNumber: roomId,
    capacity: 100,
    type: 'standard',
  };
}

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

function targetOccupancy(showtime, cinema, room) {
  const start = new Date(showtime.startTime);
  const day = start.getDay();
  const hour = start.getHours();
  const weekend = day === 0 || day === 6;
  const past = new Date(showtime.endTime) < new Date();

  let occupancy = 0.34;
  occupancy += (CITY_DEMAND[cinema.city] || 0.85) - 1;
  occupancy += weekend ? 0.2 : 0;
  occupancy += hour >= 18 && hour <= 21 ? 0.18 : 0;
  occupancy += hour < 12 ? -0.08 : 0;
  occupancy += room.type === 'imax' ? 0.08 : room.type === 'vip' ? -0.03 : 0;
  occupancy += past ? 0.08 : -0.12;

  const randomNoise = faker.number.float({ min: -0.08, max: 0.08, fractionDigits: 2 });
  return clamp(occupancy + randomNoise, past ? 0.28 : 0.08, weekend ? 0.94 : 0.82);
}

function priceForSeat(showtime, seatNumber, room) {
  const row = seatNumber.charAt(0);
  const rowPremium = ['E', 'F', 'G', 'H'].includes(row) ? 10000 : 0;
  const vipSeatPremium = room.type === 'vip' ? 15000 : 0;
  return showtime.basePrice + rowPremium + vipSeatPremium;
}

function bookingTimeFor(showtime) {
  const start = new Date(showtime.startTime);
  const hoursBefore = weighted([
    { weight: 12, value: faker.number.int({ min: 1, max: 6 }) },
    { weight: 9, value: faker.number.int({ min: 7, max: 24 }) },
    { weight: 5, value: faker.number.int({ min: 25, max: 72 }) },
    { weight: 2, value: faker.number.int({ min: 73, max: 168 }) },
  ]);

  const bookingTime = new Date(start.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();

  if (bookingTime > now) {
    return faker.date.recent({ days: 3 });
  }

  return bookingTime;
}

function paymentMethod(staff) {
  if (staff) {
    return weighted([
      { weight: 7, value: 'cash' },
      { weight: 3, value: 'card' },
      { weight: 1, value: 'momo' },
    ]);
  }

  return weighted([
    { weight: 5, value: 'momo' },
    { weight: 4, value: 'card' },
    { weight: 2, value: 'zalopay' },
  ]);
}

function nextTicketCount(remainingSeats) {
  const requested = weighted([
    { weight: 35, value: 2 },
    { weight: 24, value: 1 },
    { weight: 22, value: 3 },
    { weight: 14, value: 4 },
    { weight: 5, value: 5 },
  ]);

  return Math.min(requested, remainingSeats);
}

async function seedBookings({ users, employees, showtimes, cinemasById, runId }) {
  const customers = users.filter(user => user.role === 'KHACHHANG');
  const activeStaff = employees.filter(user => user.role === 'NHANVIEN' && user.isActive !== false);
  const bookings = [];
  let sequence = 1;

  for (const showtime of showtimes) {
    const cinema = cinemasById.get(showtime.cinemaId);
    if (!cinema) continue;

    const room = roomFor(cinema, showtime.roomId);
    const seats = faker.helpers.shuffle(makeSeats(room.capacity));
    const seatTarget = Math.round(room.capacity * targetOccupancy(showtime, cinema, room));
    const bookedSeats = [];

    while (bookedSeats.length < seatTarget && seats.length > 0) {
      const ticketCount = nextTicketCount(seatTarget - bookedSeats.length);
      const selectedSeats = seats.splice(0, ticketCount);
      const staff = activeStaff.length > 0 && faker.datatype.boolean({ probability: 0.32 })
        ? faker.helpers.arrayElement(activeStaff)
        : null;

      const tickets = selectedSeats.map(seatNumber => ({
        seatNumber,
        price: priceForSeat(showtime, seatNumber, room),
        status: 'CONFIRMED',
      }));

      bookedSeats.push(...selectedSeats.map(seatNumber => ({
        seatNumber,
        status: 'BOOKED',
      })));

      bookings.push({
        bookingCode: `BK-${runId}-${String(sequence).padStart(6, '0')}`,
        userId: faker.helpers.arrayElement(customers).id,
        showtimeId: showtime.id,
        staffId: staff ? staff.id : null,
        paymentMethod: paymentMethod(staff),
        promotionCode: weighted([
          { weight: 62, value: null },
          { weight: 14, value: 'TNCWELCOME' },
          { weight: 10, value: 'WEEKEND10' },
          { weight: 8, value: 'TNCSTUDENT' },
          { weight: 6, value: 'COMBO15' },
        ]),
        totalPrice: tickets.reduce((sum, ticket) => sum + ticket.price, 0),
        bookingTime: bookingTimeFor(showtime),
        tickets,
      });

      sequence += 1;
    }

    if (bookedSeats.length > 0) {
      showtime.bookedSeats = bookedSeats;
    }
  }

  const createdBookings = await Booking.bulkCreate(bookings);

  for (const showtime of showtimes) {
    if ((showtime.bookedSeats || []).length > 0) {
      await showtime.update({ bookedSeats: showtime.bookedSeats });
    }
  }

  return createdBookings;
}

module.exports = seedBookings;
