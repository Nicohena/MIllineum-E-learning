import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import adminService from '../../services/adminService';

const days = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const emptyForm = {
  class_id: '',
  assignment_id: '',
  day_of_week: 'monday',
  start_time: '08:00',
  end_time: '08:45',
  room: '',
  notes: '',
};

const formatTime = (value) => (value ? value.slice(0, 5) : '');

const TimetableManagement = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classList, assignmentList, timetableData] = await Promise.all([
        adminService.getClasses(),
        adminService.getAssignments(),
        adminService.getTimetable(),
      ]);

      setClasses(classList);
      setAssignments(assignmentList);
      setEntries(timetableData.entries || []);
      setActiveYear(timetableData.active_year || null);
    } catch (error) {
      showFeedback(error?.response?.data?.error || 'Failed to load timetable data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => Number(assignment.id) === Number(form.assignment_id)),
    [assignments, form.assignment_id]
  );

  const filteredAssignments = useMemo(() => {
    if (!form.class_id) {
      return assignments;
    }

    return assignments.filter((assignment) => Number(assignment.class_id) === Number(form.class_id));
  }, [assignments, form.class_id]);

  const visibleEntries = useMemo(() => {
    if (selectedClassId === 'all') {
      return entries;
    }

    return entries.filter((entry) => Number(entry.class_id) === Number(selectedClassId));
  }, [entries, selectedClassId]);

  const stats = useMemo(() => {
    const teacherIds = new Set(visibleEntries.map((entry) => entry.teacher_id));
    const classIds = new Set(visibleEntries.map((entry) => entry.class_id));

    return [
      { label: 'Weekly lessons', value: visibleEntries.length },
      { label: 'Classes covered', value: classIds.size },
      { label: 'Teachers scheduled', value: teacherIds.size },
    ];
  }, [visibleEntries]);

  const entriesByDay = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day.key] = visibleEntries
        .filter((entry) => entry.day_of_week === day.key)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      return acc;
    }, {});
  }, [visibleEntries]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingEntry(null);
  };

  const handleClassChange = (classId) => {
    setForm((current) => ({
      ...current,
      class_id: classId,
      assignment_id: '',
    }));
  };

  const handleEdit = (entry) => {
    const assignment = assignments.find((item) =>
      Number(item.class_id) === Number(entry.class_id)
      && Number(item.subject_id) === Number(entry.subject_id)
      && Number(item.teacher_id) === Number(entry.teacher_id)
    );

    setEditingEntry(entry);
    setForm({
      class_id: String(entry.class_id),
      assignment_id: assignment ? String(assignment.id) : '',
      day_of_week: entry.day_of_week,
      start_time: formatTime(entry.start_time),
      end_time: formatTime(entry.end_time),
      room: entry.room || '',
      notes: entry.notes || '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAssignment) {
      showFeedback('Select a class assignment before saving a timetable slot', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      class_id: Number(selectedAssignment.class_id),
      subject_id: Number(selectedAssignment.subject_id),
      teacher_id: Number(selectedAssignment.teacher_id),
      academic_year_id: Number(selectedAssignment.academic_year_id),
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      room: form.room.trim(),
      notes: form.notes.trim(),
    };

    try {
      if (editingEntry) {
        await adminService.updateTimetableEntry(editingEntry.id, payload);
        showFeedback('Timetable slot updated');
      } else {
        await adminService.createTimetableEntry(payload);
        showFeedback('Timetable slot created');
      }

      resetForm();
      await loadData();
    } catch (error) {
      showFeedback(error?.response?.data?.error || 'Failed to save timetable slot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete ${entry.subject_name} on ${entry.day_of_week}?`)) {
      return;
    }

    try {
      await adminService.deleteTimetableEntry(entry.id);
      if (editingEntry?.id === entry.id) {
        resetForm();
      }
      showFeedback('Timetable slot deleted');
      await loadData();
    } catch (error) {
      showFeedback(error?.response?.data?.error || 'Failed to delete timetable slot', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {feedback && (
        <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-2xl ${
          feedback.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 text-indigo-600">
            <CalendarDays size={24} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Timetable</span>
          </div>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Timetable Management</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            Schedule class periods by teacher, subject, room, day, and time for {activeYear?.name || 'the active academic year'}.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-2xl font-black text-slate-900">{item.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">{editingEntry ? 'Edit Slot' : 'Create Slot'}</h2>
              <p className="mt-1 text-xs font-medium text-slate-400">Use existing class-teacher assignments.</p>
            </div>
            {editingEntry && (
              <button type="button" onClick={resetForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class</span>
            <select
              required
              value={form.class_id}
              onChange={(event) => handleClassChange(event.target.value)}
              className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="">Select class...</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject & Teacher</span>
            <select
              required
              value={form.assignment_id}
              onChange={(event) => setForm((current) => ({ ...current, assignment_id: event.target.value }))}
              disabled={!form.class_id}
              className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
            >
              <option value="">{form.class_id ? 'Select assignment...' : 'Select class first...'}</option>
              {filteredAssignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.subject_name} - {assignment.teacher_name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Day</span>
              <select
                value={form.day_of_week}
                onChange={(event) => setForm((current) => ({ ...current, day_of_week: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold capitalize text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                {days.map((day) => (
                  <option key={day.key} value={day.key}>{day.key}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Room</span>
              <input
                value={form.room}
                onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))}
                placeholder="Room 204"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start</span>
              <input
                required
                type="time"
                value={form.start_time}
                onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">End</span>
              <input
                required
                type="time"
                value={form.end_time}
                onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={3}
              placeholder="Optional schedule note..."
              className="w-full resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {editingEntry ? 'Update Slot' : 'Create Slot'}
          </button>
        </form>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Weekly Grid</h2>
              <p className="text-xs font-medium text-slate-400">Filter by class or review the whole active timetable.</p>
            </div>
            <select
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="all">All classes</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-100 bg-white">
              <Loader2 size={42} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              {days.map((day) => (
                <div key={day.key} className="min-h-[360px] rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{day.label}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                      {entriesByDay[day.key].length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {entriesByDay[day.key].length > 0 ? (
                      entriesByDay[day.key].map((entry) => (
                        <article key={entry.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">{entry.subject_name}</p>
                              <p className="truncate text-xs font-bold text-indigo-700">{entry.class_name}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(entry)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
                                title="Edit slot"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-red-600"
                                title="Delete slot"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2 text-xs font-bold text-slate-500">
                            <p className="flex items-center gap-2"><Clock3 size={14} /> {formatTime(entry.start_time)} - {formatTime(entry.end_time)}</p>
                            <p className="truncate">{entry.teacher_name}</p>
                            {entry.room && <p className="flex items-center gap-2"><MapPin size={14} /> {entry.room}</p>}
                          </div>

                          {entry.notes && (
                            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-slate-500">{entry.notes}</p>
                          )}
                        </article>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                        <p className="text-xs font-bold text-slate-400">No slots</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TimetableManagement;
