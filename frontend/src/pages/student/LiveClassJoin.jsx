import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ExternalLink, Loader2, User, Video, X } from 'lucide-react';
import liveClassService from '../../services/liveClassService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  live: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-blue-50 text-blue-700',
};

const LiveClassJoin = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await liveClassService.getStudentSessions();
      setSessions(data);
    } catch {
      showToast('Failed to load live classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!user?.token) {
      return undefined;
    }

    const socket = socketService.connect({ token: user.token, user });
    if (!socket) {
      return undefined;
    }

    const offSessionChanged = socketService.on('live-class:session-changed', (payload) => {
      if (!payload?.classId || String(payload.classId) !== String(user.class_id)) {
        return;
      }

      load();
    });

    const offAttendanceUpdated = socketService.on('live-class:attendance-updated', (payload) => {
      if (!payload?.sessionId) {
        return;
      }

      setSessions((prev) => prev.map((session) => (
        String(session.id) === String(payload.sessionId)
          ? { ...session, online_attendees: payload.onlineCount }
          : session
      )));
    });

    return () => {
      offSessionChanged();
      offAttendanceUpdated();
    };
  }, [user]);

  const nextClass = useMemo(() => sessions.find((session) => session.status === 'live') || sessions[0], [sessions]);

  const joinClass = (session) => {
    liveClassService.joinSession({
      sessionId: session.id,
      teacherId: session.teacher_id,
      classId: session.class_id ?? user?.class_id ?? null,
      studentId: user?.id,
      studentName: user?.name,
    });

    window.open(session.meeting_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold shadow-2xl ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Live Classes</h1>
        <p className="mt-1 font-medium text-slate-500">Attend live sessions for your enrolled courses.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <Video size={48} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-700">No live classes available</h3>
          <p className="mt-2 font-medium text-slate-400">When your teacher schedules a live class, it will appear here.</p>
        </div>
      ) : (
        <>
          {nextClass && (
            <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white/70">
                    <span className={`h-2.5 w-2.5 rounded-full ${nextClass.status === 'live' ? 'animate-pulse bg-emerald-400' : 'bg-blue-400'}`} />
                    {nextClass.status === 'live' ? 'Live now' : 'Next class'}
                  </div>
                  <h2 className="text-2xl font-black">{nextClass.title}</h2>
                  <p className="mt-1 text-white/70">{nextClass.course_title} with {nextClass.teacher_name}</p>
                </div>
                <button
                  onClick={() => joinClass(nextClass)}
                  className="flex w-max items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-slate-900 transition-all hover:bg-slate-100"
                >
                  Join Class <ExternalLink size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">Available Sessions</h3>
            {sessions.map((session) => (
              <div key={session.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-600">{session.course_title}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusStyles[session.status]}`}>{session.status}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{session.title}</h4>
                    {session.description && <p className="mt-1 text-sm text-slate-500">{session.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><User size={15} />{session.teacher_name}</span>
                      <span className="flex items-center gap-1.5"><CalendarClock size={15} />{new Date(session.scheduled_at).toLocaleString()}</span>
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                  </div>
                  <button
                    onClick={() => joinClass(session)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all ${
                      session.status === 'live'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {session.status === 'live' ? 'Join Now' : 'Open Link'} <ExternalLink size={17} />
                  </button>
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Live attendees: {session.online_attendees || 0}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LiveClassJoin;
