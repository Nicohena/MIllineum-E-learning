import api from './api';
import storage from '../utils/localStorage';

const USER_KEY = 'user';

export const authService = {
  login: async ({ identifier, password }) => {
    const response = await api.post('/auth/login', { identifier, password });
    const payload = {
      ...response.data.user,
      token: response.data.token,
    };

    storage.set(USER_KEY, payload);
    return payload;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    storage.remove(USER_KEY);
    return true;
  },

  getCurrentUser: () => storage.get(USER_KEY),
};

export default authService;
