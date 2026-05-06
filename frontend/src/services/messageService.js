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

  sendMessage: async (receiverId, content, parentId = null) => {
    const response = await api.post('/messages/send', { receiver_id: receiverId, content, parent_id: parentId });
    return response.data;
  },

  getThreadMessages: async (parentId, isGroup = false) => {
    const response = await api.get(`/messages/thread?parent_id=${parentId}&is_group=${isGroup ? 1 : 0}`);
    return response.data.messages || [];
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
