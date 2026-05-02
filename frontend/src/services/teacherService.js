import api from './api';

const teacherService = {
  /**
   * Get all courses assigned to the current teacher
   */
  getCourses: async () => {
    try {
      const response = await api.get('/teacher/courses');
      return response.data.courses;
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      throw error;
    }
  }
};

export default teacherService;
