import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Play,
  Plus,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import liveClassService from '../../services/liveClassService';
import teacherService from '../../services/teacherService';

const emptyForm = {
  course_id: '',
  title: '',
  description: '',
  meeting_url: '',
  scheduled_at: '',
  duration_minutes: 60,
};

const statusStyles = {
  live: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-blue-50 text-blue-700',
  ended: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-50 text-red-600',
};

const TeacherLiveClass = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [sessionData, courseData] = await Promise.all([
        liveClassService.getTeacherSessions(),
        teacherService.getCourses(),
      ]);
      setSessions(sessionData);
      setCourses(courseData);
    } catch {
      showToast('Failed to load live classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => ({
    total: sessions.length,
    live: sessions.filter((session) => session.status === 'live').length,
    scheduled: sessions.filter((session) => session.status === 'scheduled').length,
    attendees: sessions.reduce((sum, session) => sum + Number(session.attendee_count || 0), 0),
  }), [sessions]);

  const createSession = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await liveClassService.createSession(form);
      setForm(emptyForm);
      setShowCreate(false);
      showToast('Live class scheduled');
      await load();
    } catch (error) {
      showToast(error?.response?.data?.error || 'Failed to schedule live class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (sessionId, status) => {
    try {
      await liveClassService.updateStatus(sessionId, status);
      showToast(status === 'live' ? 'Class is now live' : 'Live class updated');
      await load();
    } catch {
      showToast('Could not update live class', 'error');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Delete this live class?')) return;
    try {
      await liveClassService.deleteSession(sessionId);
      showToast('Live class deleted');
      await load();
    } catch {
      showToast('Could not delete live class', 'error');
    }
  };

  const openMeeting = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Live Classes</h1>
          <p className="mt-1 font-medium text-slate-500">Schedule sessions, start class, and share the meeting room with students.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-max items-center gap-2 rounded-2xl bg-primary-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-primary-200 transition-all hover:bg-primary-700 active:scale-95"
        >
          <Plus size={20} /> New Live Class
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, icon: Video, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Live Now', value: stats.live, icon: Play, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Scheduled', value: stats.scheduled, icon: CalendarClock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Students', value: stats.attendees, icon: Users, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`rounded-xl p-3 ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-2xl font-black text-slate-800">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <Video size={48} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-700">No live classes yet</h3>
          <p className="mt-2 font-medium text-slate-400">Create a session for one of your assigned courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">{session.course_title}</span>
                  <h3 className="mt-1 text-xl font-black leading-tight text-slate-900">{session.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{session.class_name || 'Assigned class'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusStyles[session.status]}`}>
                  {session.status}
                </span>
              </div>

              {session.description && <p className="mt-4 text-sm text-slate-500">{session.description}</p>}

              <div className="mt-5 grid grid-cols-1 gap-3 text-sm font-bold text-slate-500 md:grid-cols-3">
                <span className="flex items-center gap-2"><CalendarClock size={16} />{new Date(session.scheduled_at).toLocaleString()}</span>
                <span>{session.duration_minutes} minutes</span>
                <span className="flex items-center gap-2"><Users size={16} />{session.attendee_count || 0} students</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
                <button
                  onClick={() => openMeeting(session.meeting_url)}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
                >
                  <ExternalLink size={16} /> Open Room
                </button>
                {session.status !== 'live' && session.status !== 'ended' && (
                  <button
                    onClick={() => updateStatus(session.id, 'live')}
                    className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                  >
                    <Play size={16} /> Start
                  </button>
                )}
                {session.status === 'live' && (
                  <button
                    onClick={() => updateStatus(session.id, 'ended')}
                    className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
                  >
                    End Class
                  </button>
                )}
                <button
                  onClick={() => deleteSession(session.id)}
                  className="ml-auto rounded-xl p-2.5 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete live class"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-7">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Schedule Live Class</h2>
                <p className="mt-1 text-sm text-slate-500">Add the meeting link students will use to attend.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-full p-2 transition-colors hover:bg-slate-200"><X size={22} /></button>
            </div>
            <form onSubmit={createSession} className="max-h-[70vh] space-y-5 overflow-y-auto p-8">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Course</label>
                <select
                  required
                  value={form.course_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, course_id: event.target.value }))}
                  className="w-full rounded-2xl bg-slate-50 px-5 py-3.5 font-bold text-slate-700 outline-none"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl bg-slate-50 px-5 py-3.5 font-bold text-slate-700 outline-none"
                  placeholder="e.g. Unit 4 revision"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting URL</label>
                <input
                  required
                  type="url"
                  value={form.meeting_url}
                  onChange={(event) => setForm((prev) => ({ ...prev, meeting_url: event.target.value }))}
                  className="w-full rounded-2xl bg-slate-50 px-5 py-3.5 font-bold text-slate-700 outline-none"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Starts</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(event) => setForm((prev) => ({ ...prev, scheduled_at: event.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 px-5 py-3.5 font-bold text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Minutes</label>
                  <input
                    type="number"
                    min="15"
                    value={form.duration_minutes}
                    onChange={(event) => setForm((prev) => ({ ...prev, duration_minutes: event.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 px-5 py-3.5 font-bold text-slate-700 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full resize-none rounded-2xl bg-slate-50 px-5 py-3.5 text-slate-700 outline-none"
                  placeholder="Optional notes for students"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-2xl bg-slate-50 py-4 font-bold text-slate-500 transition-all hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={submitting} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 disabled:opacity-60">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {submitting ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLiveClass;
