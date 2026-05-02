import api from './api';

const studentService = {
  /**
   * Get student schedule (assigned courses/subjects)
   */
  getSchedule: async () => {
    const response = await api.get('/student/schedule');
    return response.data;
  },

  /**
   * Get full course content by ID
   */
  getCourseContent: async (courseId) => {
    const response = await api.get(`/student/course-content?course_id=${courseId}`);
    return response.data;
  },

  /**
   * Get student's enrolled class details
   */
  getClassDetails: async () => {
    const response = await api.get('/student/schedule');
    return response.data.class;
  },

  /**
   * Get student's graded assignments
   */
  getGrades: async () => {
    const response = await api.get('/student/grades');
    return response.data.grades || [];
  }
};

export default studentService;
