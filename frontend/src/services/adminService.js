import api from './api';

const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },
  // Get all users
  getUsers: async (role) => {
    const response = await api.get('/admin/users', {
      params: {
        ...(role && role !== 'all' ? { role } : {}),
        page: 1,
        per_page: 500,
      },
    });
    return response.data.users || [];
  },
  // Register a new user
  registerUser: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  // Get all classes
  getClasses: async () => {
    const response = await api.get('/classes');
    return response.data.classes || [];
  },
  // Create a new class
  createClass: async (payload) => {
    const response = await api.post('/classes', payload);
    return response.data;
  },
  // Delete a class
  deleteClass: async (classId) => {
    const response = await api.delete(`/classes?id=${classId}`);
    return response.data;
  },
  // Get all subjects
  getSubjects: async () => {
    const response = await api.get('/subjects');
    return response.data.subjects || [];
  },
  // Create a new subject
  createSubject: async (subjectData) => {
    const payload = typeof subjectData === 'string'
      ? { name: subjectData }
      : subjectData;
    const response = await api.post('/subjects', payload);
    return response.data;
  },
  // Delete a subject
  deleteSubject: async (subjectId) => {
    const response = await api.delete(`/subjects?id=${subjectId}`);
    return response.data;
  },
  // Get all years
  getYears: async () => {
    const response = await api.get('/admin/years');
    return response.data;
  },
  // Create a new year
  createYear: async (name) => {
    const response = await api.post('/admin/years', { name });
    return response.data;
  },

  setActiveYear: async (yearId) => {
    const response = await api.post('/admin/active-year', { year_id: yearId });
    return response.data;
  },

  deleteYear: async (yearId) => {
    const response = await api.delete(`/admin/years?id=${yearId}`);
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/admin/assignments');
    return response.data.assignments || [];
  },

  getTimetable: async (params = {}) => {
    const response = await api.get('/admin/timetable', { params });
    return response.data;
  },

  createTimetableEntry: async (payload) => {
    const response = await api.post('/admin/timetable', payload);
    return response.data;
  },

  updateTimetableEntry: async (entryId, payload) => {
    const response = await api.put(`/admin/timetable?id=${entryId}`, payload);
    return response.data;
  },

  deleteTimetableEntry: async (entryId) => {
    const response = await api.delete(`/admin/timetable?id=${entryId}`);
    return response.data;
  },

  assignTeacher: async (payload) => {
    const response = await api.post('/admin/assign', payload);
    return response.data;
  },

  assignStudent: async (payload) => {
    const response = await api.post('/admin/assign-student', payload);
    return response.data;
  },

  addTeachersToSubject: async (payload) => {
    const response = await api.post('/admin/subject-teachers', payload);
    return response.data;
  },

  removeTeacherFromSubject: async (payload) => {
    const response = await api.delete('/admin/subject-teachers', { data: payload });
    return response.data;
  },
};

export default adminService;
