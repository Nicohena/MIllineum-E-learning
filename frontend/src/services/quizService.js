import api from './api';

const quizService = {
  createQuiz: async (data) => {
    const response = await api.post('/quizzes/create', data);
    return response.data;
  },

  getMyQuizzes: async () => {
    const response = await api.get('/quizzes/my-quizzes');
    return response.data.quizzes || [];
  },

  getAttempts: async (quizId) => {
    const response = await api.get(`/quizzes/attempts?quiz_id=${quizId}`);
    return response.data.attempts || [];
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/delete?id=${id}`);
    return response.data;
  },

  getStudentQuizzes: async () => {
    const response = await api.get('/quizzes/student');
    return response.data.quizzes || [];
  },

  getStudentQuiz: async (id) => {
    const response = await api.get(`/quizzes/take?id=${id}`);
    return response.data.quiz;
  },

  submitQuiz: async (quizId, answers) => {
    const response = await api.post('/quizzes/submit', { quiz_id: quizId, answers });
    return response.data;
  },
};

export default quizService;
