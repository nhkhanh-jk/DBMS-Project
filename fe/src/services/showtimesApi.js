import api from './api';

export const showtimesApi = {
  getShowtimes: (params) => api.get('/showtimes', { params }).then(r => r.data),
  getShowtimeById: (id) => api.get(`/showtimes/${id}`).then(r => r.data),
  getShowtimeSeats: (id) => api.get(`/showtimes/${id}/seats`).then(r => r.data),
  createShowtime: (data) => api.post('/showtimes', data).then(r => r.data),
  updateShowtime: (id, data) => api.patch(`/showtimes/${id}`, data).then(r => r.data),
  deleteShowtime: (id) => api.delete(`/showtimes/${id}`).then(r => r.data),
};
