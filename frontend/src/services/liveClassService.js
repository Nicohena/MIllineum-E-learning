import api from './api';
import socketService from './socketService';

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

  notifySessionChanged: (payload) => {
    socketService.emit('live-class:session-changed', payload);
  },

  watchSession: (payload) => {
    socketService.emit('live-class:watch-session', payload);
  },

  unwatchSession: (payload) => {
    socketService.emit('live-class:unwatch-session', payload);
  },

  joinSession: (payload) => {
    socketService.emit('live-class:join-session', payload);
  },

  leaveSession: (payload) => {
    socketService.emit('live-class:leave-session', payload);
  },
};

export default liveClassService;
