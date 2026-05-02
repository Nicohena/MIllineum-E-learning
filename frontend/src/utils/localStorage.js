const PREFIX = 'elearning_';

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(PREFIX + key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

export default storage;
