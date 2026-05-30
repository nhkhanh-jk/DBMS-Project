const request = require('supertest');

jest.mock('../src/services/authService', () => ({
  registerCustomer: jest.fn(async (body) => ({ id: 'u1', ...body })),
  registerEmployee: jest.fn(async (body) => ({ id: 'e1', ...body })),
  login: jest.fn(async () => ({ token: 'ok' })),
  getProfile: jest.fn(async (id) => ({ id })),
  updateProfile: jest.fn(async (id, body) => ({ id, ...body })),
  changePassword: jest.fn(async () => ({ message: 'Password changed' })),
}));

jest.mock('../src/services/movieService', () => ({
  listMovies: jest.fn(async () => [{ id: 'm1' }]),
  getMovieById: jest.fn(async (id) => ({ id })),
  createMovie: jest.fn(async (body) => ({ id: 'm2', ...body })),
  updateMovie: jest.fn(async (id, body) => ({ id, ...body })),
}));

jest.mock('../src/services/showtimeService', () => ({
  listShowtimes: jest.fn(async () => [{ id: 's1' }]),
  getShowtimeById: jest.fn(async (id) => ({ id })),
  createShowtime: jest.fn(async (body) => ({ id: 's2', ...body })),
  updateShowtime: jest.fn(async (id, body) => ({ id, ...body })),
}));

jest.mock('../src/services/bookingService', () => ({
  createBooking: jest.fn(async () => ({ id: 'b1' })),
  getBookingById: jest.fn(async (id) => ({ id })),
}));

jest.mock('../src/services/seatService', () => ({
  listSeatsByShowtime: jest.fn(async () => [{ id: 'seat1' }]),
}));

jest.mock('../src/services/reviewService', () => ({
  listReviewsByMovie: jest.fn(async () => [{ id: 'r1' }]),
  createReview: jest.fn(async () => ({ id: 'r2' })),
}));

jest.mock('../src/services/serviceRequestService', () => ({
  createServiceRequest: jest.fn(async () => ({ id: 'sr1' })),
  getServiceRequests: jest.fn(async () => [{ id: 'sr1' }]),
  updateServiceRequestStatus: jest.fn(async (id, status) => ({ id, status })),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token) => {
    if (token === 'admin-token') return { id: 'u-admin', role: 'ADMIN', username: 'admin' };
    if (token === 'staff-token') return { id: 'u-staff', role: 'NHANVIEN', username: 'staff' };
    if (token === 'customer-token') return { id: 'u-cus', role: 'KHACHHANG', username: 'customer' };
    throw new Error('invalid');
  }),
}));

const { createApp } = require('../src/app');

describe('API contract coverage', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('GET /api/health returns OK payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(typeof res.body.timestamp).toBe('string');
  });

  test('Auth public endpoints work', async () => {
    const register = await request(app).post('/api/auth/register').send({ username: 'a' });
    const login = await request(app).post('/api/auth/login').send({ username: 'a', password: 'b' });
    expect(register.status).toBe(201);
    expect(login.status).toBe(200);
  });

  test('Auth protected endpoints enforce JWT and role', async () => {
    const noToken = await request(app).get('/api/auth/profile');
    expect(noToken.status).toBe(401);

    const profile = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer customer-token');
    expect(profile.status).toBe(200);

    const forbidden = await request(app)
      .post('/api/auth/register-employee')
      .set('Authorization', 'Bearer customer-token')
      .send({ username: 'staff' });
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .post('/api/auth/register-employee')
      .set('Authorization', 'Bearer admin-token')
      .send({ username: 'staff' });
    expect(allowed.status).toBe(201);
  });

  test('Movies endpoints cover read/write auth behavior', async () => {
    expect((await request(app).get('/api/movies')).status).toBe(200);
    expect((await request(app).get('/api/movies/m1')).status).toBe(200);
    expect((await request(app).post('/api/movies').send({ title: 'x' })).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/api/movies')
          .set('Authorization', 'Bearer staff-token')
          .send({ title: 'x' })
      ).status
    ).toBe(201);
    expect(
      (
        await request(app)
          .patch('/api/movies/m1')
          .set('Authorization', 'Bearer admin-token')
          .send({ title: 'new' })
      ).status
    ).toBe(200);
  });

  test('Showtimes endpoints cover read/write auth behavior', async () => {
    expect((await request(app).get('/api/showtimes')).status).toBe(200);
    expect((await request(app).get('/api/showtimes/s1')).status).toBe(200);
    expect((await request(app).post('/api/showtimes').send({})).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/api/showtimes')
          .set('Authorization', 'Bearer admin-token')
          .send({})
      ).status
    ).toBe(201);
    expect(
      (
        await request(app)
          .patch('/api/showtimes/s1')
          .set('Authorization', 'Bearer staff-token')
          .send({})
      ).status
    ).toBe(200);
  });

  test('Bookings endpoint requires auth', async () => {
    expect((await request(app).post('/api/bookings').send({})).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/api/bookings')
          .set('Authorization', 'Bearer customer-token')
          .send({})
      ).status
    ).toBe(201);
    expect(
      (
        await request(app)
          .get('/api/bookings/b1')
          .set('Authorization', 'Bearer customer-token')
      ).status
    ).toBe(200);
  });

  test('Seats endpoint requires auth', async () => {
    expect((await request(app).get('/api/seats/showtime/s1')).status).toBe(401);
    expect(
      (
        await request(app)
          .get('/api/seats/showtime/s1')
          .set('Authorization', 'Bearer customer-token')
      ).status
    ).toBe(200);
  });

  test('Reviews endpoints enforce KHACHHANG role for create', async () => {
    expect((await request(app).get('/api/reviews/movie/m1')).status).toBe(200);
    expect((await request(app).post('/api/reviews').send({})).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/api/reviews')
          .set('Authorization', 'Bearer staff-token')
          .send({})
      ).status
    ).toBe(403);
    expect(
      (
        await request(app)
          .post('/api/reviews')
          .set('Authorization', 'Bearer customer-token')
          .send({})
      ).status
    ).toBe(201);
  });

  test('Service requests endpoints enforce auth/role', async () => {
    expect((await request(app).post('/api/service-requests').send({})).status).toBe(401);
    expect(
      (
        await request(app)
          .post('/api/service-requests')
          .set('Authorization', 'Bearer customer-token')
          .send({})
      ).status
    ).toBe(201);
    expect(
      (
        await request(app)
          .get('/api/service-requests')
          .set('Authorization', 'Bearer customer-token')
      ).status
    ).toBe(200);
    expect(
      (
        await request(app)
          .patch('/api/service-requests/sr1/status')
          .set('Authorization', 'Bearer customer-token')
          .send({ status: 'DONE' })
      ).status
    ).toBe(403);
    expect(
      (
        await request(app)
          .patch('/api/service-requests/sr1/status')
          .set('Authorization', 'Bearer admin-token')
          .send({ status: 'DONE' })
      ).status
    ).toBe(200);
  });
});
