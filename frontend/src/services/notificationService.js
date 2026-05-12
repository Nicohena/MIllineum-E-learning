import api from './api';

const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/list');
    return response.data;
  },

  getNotificationStats: async () => {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  getNotificationsByType: async (type, limit = 20) => {
    const response = await api.get(`/notifications/by-type?type=${type}&limit=${limit}`);
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

  markReadBatch: async (notificationIds) => {
    const response = await api.post('/notifications/mark-batch', {
      notification_ids: notificationIds
    });
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/delete/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  },

  sendNotification: async (recipientId, type, title, content, options = {}) => {
    const response = await api.post('/notifications/send', {
      recipient_id: recipientId,
      type: type,
      title: title,
      content: content,
      link: options.link || null,
      send_email: options.send_email !== false,
      send_push: options.send_push !== false
    });
    return response.data;
  }
};

export default notificationService;
