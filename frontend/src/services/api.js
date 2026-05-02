import axios from 'axios';
import storage from '../utils/localStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/E-learning/backend/index.php/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const user = storage.get('user');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  // Let browser set multipart boundaries automatically for file uploads.
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
