let state = {
  notifications: [
    { id: 1, message: 'Assignment due tomorrow', read: false },
    { id: 2, message: 'New class recording available', read: false },
    { id: 3, message: 'Forum reply from instructor', read: true },
  ],
};

const subscribers = new Set();

const notify = () => {
  subscribers.forEach((listener) => listener(state));
};

export const notificationStore = {
  getState: () => state,

  subscribe: (listener) => {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  },

  addNotification: (message) => {
    state = {
      ...state,
      notifications: [
        { id: Date.now(), message, read: false },
        ...state.notifications,
      ],
    };
    notify();
  },

  markAsRead: (id) => {
    state = {
      ...state,
      notifications: state.notifications.map((item) =>
        String(item.id) === String(id) ? { ...item, read: true } : item
      ),
    };
    notify();
  },
};

export default notificationStore;
