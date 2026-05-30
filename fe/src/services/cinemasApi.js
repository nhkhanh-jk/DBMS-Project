import api from './api';

export const cinemasApi = {
  getCinemas: () => api.get('/cinemas').then(r => r.data),
  getCinemaById: (id) => api.get(`/cinemas/${id}`).then(r => r.data),
  createCinema: (data) => api.post('/cinemas', data).then(r => r.data),
  updateCinema: (id, data) => api.patch(`/cinemas/${id}`, data).then(r => r.data),
  deleteCinema: (id) => api.delete(`/cinemas/${id}`).then(r => r.data),
};

export const usersApi = {
  getUsers: (params) => api.get('/users', { params }).then(r => r.data),
  updateUserStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }).then(r => r.data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data).then(r => r.data),
};

export const reviewsApi = {
  getReviewsByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`).then(r => r.data),
  createReview: (data) => api.post('/reviews', data).then(r => r.data),
};
