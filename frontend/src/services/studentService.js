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
  },

  /**
   * Get student's attendance records
   */
  getAttendance: async (month, year, courseId = null) => {
    const params = new URLSearchParams({ month, year });
    if (courseId) params.append('course_id', courseId);

    const response = await api.get(`/attendance/my?${params}`);
    return response.data;
  }
};

export default studentService;
