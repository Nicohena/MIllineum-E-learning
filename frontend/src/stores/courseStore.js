import { mockCourses } from '../services/mock/mockData';

let state = {
  courses: [...mockCourses],
};

const subscribers = new Set();

const notify = () => {
  subscribers.forEach((listener) => listener(state));
};

export const courseStore = {
  getState: () => state,

  subscribe: (listener) => {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  },

  setCourses: (courses) => {
    state = { ...state, courses: [...courses] };
    notify();
  },

  updateCourseProgress: ({ courseId, progress }) => {
    state = {
      ...state,
      courses: state.courses.map((course) =>
        String(course.id) === String(courseId) ? { ...course, progress } : course
      ),
    };
    notify();
  },
};

export default courseStore;
