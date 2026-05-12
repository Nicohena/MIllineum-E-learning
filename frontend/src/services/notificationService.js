import api from './api';

const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/list');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/notifications/mark-read/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/delete/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  }
};

export default notificationService;
