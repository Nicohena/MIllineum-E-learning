import { io } from 'socket.io-client';

let socket;

const defaultUrl = 'http://localhost:4000';

const connect = ({ token, user }) => {
  if (!token || !user) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || defaultUrl, {
    transports: ['websocket', 'polling'],
    auth: {
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        class_id: user.class_id ?? null,
      },
    },
  });

  return socket;
};

const getSocket = () => socket;

const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const on = (eventName, handler) => {
  if (!socket) {
    return () => {};
  }

  socket.on(eventName, handler);
  return () => socket?.off(eventName, handler);
};

const emit = (eventName, payload) => {
  socket?.emit(eventName, payload);
};

export const socketService = {
  connect,
  getSocket,
  disconnect,
  on,
  emit,
};

export default socketService;
