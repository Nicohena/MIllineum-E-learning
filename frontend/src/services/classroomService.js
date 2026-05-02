const liveSessions = [
  { id: 1, title: 'React Live Lab', startTime: '2026-04-18T10:30:00Z', instructor: 'Dr. Sarah Johnson' },
  { id: 2, title: 'UI Critique Session', startTime: '2026-04-18T14:00:00Z', instructor: 'Emily Rodriguez' },
  { id: 3, title: 'API Security Workshop', startTime: '2026-04-19T09:00:00Z', instructor: 'Michael Chen' },
];

export const classroomService = {
  getSessions: async () => liveSessions,

  getUpcomingSessions: async () =>
    liveSessions.filter((session) => new Date(session.startTime).getTime() > Date.now()),

  joinSession: async (sessionId) => {
    const session = liveSessions.find((item) => String(item.id) === String(sessionId));
    if (!session) throw new Error('Session not found');
    return {
      ...session,
      joinUrl: `https://example.com/live/${session.id}`,
    };
  },
};

export default classroomService;
