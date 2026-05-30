import api from './api';

export const moviesApi = {
  getMovies: (status) => api.get('/movies', { params: status ? { status } : {} }).then(r => r.data),
  getMovieById: (id) => api.get(`/movies/${id}`).then(r => r.data),
  createMovie: (data) => api.post('/movies', data).then(r => r.data),
  updateMovie: (id, data) => api.patch(`/movies/${id}`, data).then(r => r.data),
  deleteMovie: (id) => api.delete(`/movies/${id}`).then(r => r.data),
};
