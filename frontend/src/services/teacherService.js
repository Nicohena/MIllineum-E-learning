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
  },

  /**
   * Mark attendance for a student in a session
   */
  markAttendance: async (sessionId, studentId, status, timestamp = null) => {
    const response = await api.post('/attendance/mark', {
      session_id: sessionId,
      student_id: studentId,
      status,
      timestamp
    });
    return response.data;
  },

  /**
   * Get attendance for a specific session
   */
  getSessionAttendance: async (sessionId) => {
    const response = await api.get(`/attendance/session?session_id=${sessionId}`);
    return response.data.attendance;
  },

  /**
   * Bulk mark attendance for multiple students
   */
  bulkMarkAttendance: async (sessionId, attendanceRecords) => {
    const response = await api.post('/attendance/bulk', {
      session_id: sessionId,
      attendance: attendanceRecords
    });
    return response.data;
  }
};

export default teacherService;
