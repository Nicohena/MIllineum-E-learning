import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || '9e4b7c2a1f8d5e3a6b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4g3h2i1j0k9l8m';
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(port, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const sessionPresence = new Map();

const baseUser = (user = {}) => ({
  id: Number(user.id),
  role: user.role,
  name: user.name || 'Unknown user',
  class_id: user.class_id ? Number(user.class_id) : null,
});

const roomNames = {
  teacher: (teacherId) => `teacher:${teacherId}`,
  class: (classId) => `class:${classId}`,
  session: (sessionId) => `session:${sessionId}`,
};

const summarizePresence = (sessionId) => {
  const attendees = sessionPresence.get(String(sessionId));
  if (!attendees) {
    return [];
  }

  return [...attendees.values()].map((attendee) => ({
    studentId: attendee.studentId,
    studentName: attendee.studentName,
    joinedAt: attendee.joinedAt,
  }));
};

const broadcastAttendance = (sessionId, teacherId) => {
  const onlineAttendees = summarizePresence(sessionId);
  const payload = {
    sessionId,
    teacherId,
    onlineCount: onlineAttendees.length,
    attendees: onlineAttendees,
  };

  io.to(roomNames.session(sessionId)).emit('live-class:attendance-updated', payload);

  if (teacherId) {
    io.to(roomNames.teacher(teacherId)).emit('live-class:attendance-updated', payload);
  }
};

const removeFromPresence = (socket) => {
  const joinedSessions = socket.data.joinedSessions || new Map();

  joinedSessions.forEach((details, sessionId) => {
    const attendees = sessionPresence.get(String(sessionId));
    if (!attendees) {
      return;
    }

    attendees.delete(socket.id);
    if (attendees.size === 0) {
      sessionPresence.delete(String(sessionId));
    }

    broadcastAttendance(String(sessionId), details.teacherId);
  });

  socket.data.joinedSessions = new Map();
};

io.use((socket, next) => {
  const { token, user } = socket.handshake.auth || {};

  if (!token || !user?.id || !user?.role) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (Number(decoded.id) !== Number(user.id) || decoded.role !== user.role) {
      return next(new Error('Unauthorized'));
    }

    socket.data.user = baseUser(user);
    socket.data.joinedSessions = new Map();
    return next();
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;

  if (user.role === 'teacher') {
    socket.join(roomNames.teacher(user.id));
  }

  if (user.role === 'student' && user.class_id) {
    socket.join(roomNames.class(user.class_id));
  }

  socket.on('live-class:watch-session', ({ sessionId, teacherId }) => {
    if (!sessionId) {
      return;
    }

    if (user.role === 'teacher' && teacherId && Number(teacherId) !== user.id) {
      return;
    }

    socket.join(roomNames.session(sessionId));
    broadcastAttendance(String(sessionId), teacherId || null);
  });

  socket.on('live-class:unwatch-session', ({ sessionId }) => {
    if (!sessionId) {
      return;
    }

    socket.leave(roomNames.session(sessionId));
  });

  socket.on('live-class:session-changed', (payload = {}) => {
    if (user.role !== 'teacher' || Number(payload.teacherId) !== user.id) {
      return;
    }

    io.to(roomNames.teacher(user.id)).emit('live-class:session-changed', payload);

    if (payload.classId) {
      io.to(roomNames.class(payload.classId)).emit('live-class:session-changed', payload);
    }
  });

  socket.on('live-class:join-session', (payload = {}) => {
    if (user.role !== 'student' || !payload.sessionId || !payload.teacherId) {
      return;
    }

    const sessionId = String(payload.sessionId);
    const teacherId = Number(payload.teacherId);
    const attendees = sessionPresence.get(sessionId) || new Map();

    attendees.set(socket.id, {
      studentId: user.id,
      studentName: payload.studentName || user.name,
      joinedAt: new Date().toISOString(),
    });

    sessionPresence.set(sessionId, attendees);
    socket.join(roomNames.session(sessionId));
    socket.data.joinedSessions.set(sessionId, { teacherId });

    broadcastAttendance(sessionId, teacherId);
  });

  socket.on('live-class:leave-session', ({ sessionId, teacherId }) => {
    if (!sessionId) {
      return;
    }

    const attendees = sessionPresence.get(String(sessionId));
    if (attendees) {
      attendees.delete(socket.id);
      if (attendees.size === 0) {
        sessionPresence.delete(String(sessionId));
      }
    }

    socket.leave(roomNames.session(sessionId));
    socket.data.joinedSessions.delete(String(sessionId));
    broadcastAttendance(String(sessionId), teacherId ? Number(teacherId) : null);
  });

  socket.on('disconnect', () => {
    removeFromPresence(socket);
  });
});

console.log(`Live class socket server is running on port ${port}`);
