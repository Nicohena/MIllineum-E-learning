import api from './api';

const messageService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data.conversations || [];
  },

  getMessages: async (contactId) => {
    const response = await api.get(`/messages/chat?contact_id=${contactId}`);
    return response.data.messages || [];
  },

  sendMessage: async (receiverId, content) => {
    const response = await api.post('/messages/send', { receiver_id: receiverId, content });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread');
    return response.data.unread_count || 0;
  },

  getContacts: async () => {
    const response = await api.get('/messages/contacts');
    return response.data.contacts || [];
  }
};

export default messageService;
