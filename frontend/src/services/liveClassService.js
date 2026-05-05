import api from './api';

const liveClassService = {
  createSession: async (data) => {
    const response = await api.post('/live-classes/create', data);
    return response.data;
  },

  getTeacherSessions: async () => {
    const response = await api.get('/live-classes/teacher');
    return response.data.sessions || [];
  },

  getStudentSessions: async () => {
    const response = await api.get('/live-classes/student');
    return response.data.sessions || [];
  },

  updateStatus: async (sessionId, status) => {
    const response = await api.post('/live-classes/status', { session_id: sessionId, status });
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/live-classes/delete?id=${sessionId}`);
    return response.data;
  },
};

export default liveClassService;
