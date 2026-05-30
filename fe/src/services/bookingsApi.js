import api from './api';

export const bookingsApi = {
  createBooking: (data) => api.post('/bookings', data).then(r => r.data),
  getMyBookings: () => api.get('/bookings/me').then(r => r.data),
  getBookingById: (id) => api.get(`/bookings/${id}`).then(r => r.data),
  getMyTickets: () => api.get('/users/tickets').then(r => r.data),
};
