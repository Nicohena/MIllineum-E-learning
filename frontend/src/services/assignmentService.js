import api from './api';

const assignmentService = {
  // ── Teacher ─────────────────────────────────────────
  createAssignment: async (data, file = null) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append('file', file);
    const response = await api.post('/assignments/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get('/assignments/my-assignments');
    return response.data.assignments || [];
  },

  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/assignments/submissions?assignment_id=${assignmentId}`);
    return response.data.submissions || [];
  },

  gradeSubmission: async (submissionId, grade, feedback = '') => {
    const response = await api.post('/assignments/grade', { submission_id: submissionId, grade, feedback });
    return response.data;
  },

  getRecentSubmissions: async () => {
    const response = await api.get('/assignments/recent-submissions');
    return response.data.submissions || [];
  },

  deleteAssignment: async (id) => {
    const response = await api.delete(`/assignments/delete?id=${id}`);
    return response.data;
  },

  // ── Student ─────────────────────────────────────────
  getStudentAssignments: async () => {
    const response = await api.get('/assignments/student');
    return response.data.assignments || [];
  },

  submitAssignment: async (assignmentId, file, notes = '') => {
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    formData.append('file', file);
    formData.append('notes', notes);
    const response = await api.post('/assignments/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

export default assignmentService;
