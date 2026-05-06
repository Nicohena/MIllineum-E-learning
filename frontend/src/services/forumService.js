import api from './api';

const forumService = {
  getCategories: async () => {
    const response = await api.get('/forum/categories');
    return response.data.categories || [];
  },

  getThreads: async (categoryId = null, search = '') => {
    let url = '/forum/threads';
    const params = [];
    if (categoryId) params.push(`category_id=${categoryId}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    const response = await api.get(url);
    return response.data.threads || [];
  },

  getThread: async (threadId) => {
    const response = await api.get(`/forum/thread/${threadId}`);
    return response.data.thread;
  },

  createThread: async (threadData) => {
    const response = await api.post('/forum/threads', threadData);
    return response.data;
  },

  addReply: async (replyData) => {
    const response = await api.post('/forum/reply', replyData);
    return response.data;
  },

  togglePin: async (threadId) => {
    const response = await api.post(`/forum/pin/${threadId}`);
    return response.data;
  }
};

export default forumService;
