import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tnc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tnc_token');
      localStorage.removeItem('tnc_user');
      // Only redirect if not already on a login page
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/dangnhap')) {
        window.location.href = '/dangnhap';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
