import axios from 'axios';

const api = axios.create({
  // baseURL dikosongkan karena Vite proxy otomatis mengarahkan path /api ke backend
});

// Request interceptor: otomatis menyisipkan token JWT jika ada di localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: otomatis unpack response.data dan menangani error terpadu
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Token tidak valid/kedaluwarsa, bersihkan sesi
    }
    const message = error.response?.data?.message || error.message || 'Terjadi kesalahan pada server';
    return Promise.reject(new Error(message));
  }
);

export default api;
