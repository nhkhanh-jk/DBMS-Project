const { faker } = require('@faker-js/faker');
const Booking = require('../models/Booking');

const BOOKING_COUNT = 1000;

function makeSeats(capacity) {
  const seats = [];
  const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seatsPerRow = 10;

  for (let index = 0; index < capacity; index += 1) {
    seats.push(`${rows[Math.floor(index / seatsPerRow)]}${(index % seatsPerRow) + 1}`);
  }

  return faker.helpers.shuffle(seats);
}

function roomCapacity(cinema, roomId) {
  const room = (cinema.rooms || []).find(item => item.roomNumber === roomId);
  return room ? room.capacity : 100;
}

async function seedBookings({ users, employees, showtimes, cinemasById, runId }) {
  const customers = users.filter(user => user.role === 'KHACHHANG');
  const stateByShowtime = new Map();

  for (const showtime of showtimes) {
    const cinema = cinemasById.get(showtime.cinemaId);
    stateByShowtime.set(showtime.id, {
      showtime,
      availableSeats: makeSeats(roomCapacity(cinema, showtime.roomId)),
      bookedSeats: [],
    });
  }

  const bookings = [];

  for (let index = 0; index < BOOKING_COUNT; index += 1) {
    const availableStates = [...stateByShowtime.values()].filter(state => state.availableSeats.length > 0);
    if (availableStates.length === 0) break;

    const state = faker.helpers.arrayElement(availableStates);
    const ticketCount = Math.min(faker.number.int({ min: 1, max: 4 }), state.availableSeats.length);
    const seats = state.availableSeats.splice(0, ticketCount);
    const staff = faker.datatype.boolean({ probability: 0.35 }) ? faker.helpers.arrayElement(employees) : null;

    const tickets = seats.map(seatNumber => ({
      seatNumber,
      price: state.showtime.basePrice,
      status: 'CONFIRMED',
    }));

    state.bookedSeats.push(...seats.map(seatNumber => ({
      seatNumber,
      status: 'BOOKED',
    })));

    bookings.push({
      bookingCode: `BK-${runId}-${String(index + 1).padStart(5, '0')}`,
      userId: faker.helpers.arrayElement(customers).id,
      showtimeId: state.showtime.id,
      staffId: staff ? staff.id : null,
      paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'momo']),
      promotionCode: faker.helpers.arrayElement([null, null, null, 'TNCWELCOME', 'TNCSTUDENT', 'WEEKEND10']),
      totalPrice: tickets.reduce((sum, ticket) => sum + ticket.price, 0),
      bookingTime: faker.date.recent({ days: 30 }),
      tickets,
    });
  }

  const createdBookings = await Booking.bulkCreate(bookings);

  for (const state of stateByShowtime.values()) {
    if (state.bookedSeats.length > 0) {
      await state.showtime.update({ bookedSeats: state.bookedSeats });
    }
  }

  return createdBookings;
}

module.exports = seedBookings;
