import React, { useState, useEffect } from 'react';
import {
  Plus, FileUp, Trash2, Eye, Loader2, X,
  CheckCircle2, Clock, Users, BookOpen, Calendar, FileText
} from 'lucide-react';
import assignmentService from '../../services/assignmentService';
import teacherService from '../../services/teacherService';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(null); // assignment obj
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Create form state
  const [form, setForm] = useState({ course_id: '', title: '', instructions: '', due_date: '', points: 100 });
  const [attachFile, setAttachFile] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [asgns, crs] = await Promise.all([
        assignmentService.getMyAssignments(),
        teacherService.getCourses(),
      ]);
      setAssignments(asgns);
      setCourses(crs);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignmentService.createAssignment(form, attachFile);
      setForm({ course_id: '', title: '', instructions: '', due_date: '', points: 100 });
      setAttachFile(null);
      setShowCreate(false);
      showToast('Assignment created successfully');
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setShowSubmissions(assignment);
    setLoadingSubs(true);
    try {
      const data = await assignmentService.getSubmissions(assignment.id);
      setSubmissions(data);
    } catch {
      showToast('Could not load submissions', 'error');
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeData.grade) return;
    try {
      await assignmentService.gradeSubmission(submissionId, gradeData.grade, gradeData.feedback);
      showToast('Submission graded');
      setGradingId(null);
      setGradeData({ grade: '', feedback: '' });
      const data = await assignmentService.getSubmissions(showSubmissions.id);
      setSubmissions(data);
    } catch {
      showToast('Failed to grade', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? All student submissions will also be removed.')) return;
    try {
      await assignmentService.deleteAssignment(id);
      showToast('Assignment deleted');
      await load();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const getDueBadge = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    if (diff < 0) return { label: 'Overdue', cls: 'bg-red-50 text-red-600' };
    if (diff === 0) return { label: 'Due today', cls: 'bg-amber-50 text-amber-600' };
    if (diff <= 3) return { label: `${diff}d left`, cls: 'bg-amber-50 text-amber-600' };
    return { label: `${diff}d left`, cls: 'bg-emerald-50 text-emerald-700' };
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assignments</h1>
          <p className="text-slate-500 mt-1 font-medium">Create tasks, review student submissions, and issue grades.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-200 w-max active:scale-95"
        >
          <Plus size={20} /> New Assignment
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: assignments.length, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Courses', value: courses.length, icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
          { label: 'Submissions', value: assignments.reduce((a, x) => a + Number(x.submission_count || 0), 0), icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Overdue', value: assignments.filter(a => new Date(a.due_date) < new Date()).length, icon: Clock, color: 'bg-red-50 text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-2xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
          <FileText size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No assignments yet</h3>
          <p className="text-slate-400 mt-2 font-medium">Click "New Assignment" to create your first task for students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {assignments.map(a => {
            const due = getDueBadge(a.due_date);
            return (
              <div key={a.id} className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all p-6 flex flex-col gap-4 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{a.course_title}</span>
                    <h3 className="text-lg font-black text-slate-900 mt-1 leading-tight">{a.title}</h3>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black shrink-0 ${due.cls}`}>{due.label}</span>
                </div>

                {a.instructions && (
                  <p className="text-sm text-slate-500 line-clamp-2">{a.instructions}</p>
                )}

                <div className="flex gap-4 text-xs text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Calendar size={13} />{new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Users size={13} />{a.submission_count} submitted</span>
                  <span className="flex items-center gap-1 ml-auto">{a.points} pts</span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => openSubmissions(a)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View Submissions
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create Assignment</h2>
                <p className="text-sm text-slate-500 mt-1">Students will submit a document for this task.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={22} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                <select required value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
                  <option value="">Select course…</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Chapter 3 Essay" className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                <textarea rows={4} value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                  placeholder="Detailed instructions for students…"
                  className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none text-slate-700 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input required type="datetime-local" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                  <input type="number" min="1" value={form.points} onChange={e => setForm(p => ({ ...p, points: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference File (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
                  <input type="file" id="attach-file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => setAttachFile(e.target.files[0])} />
                  <label htmlFor="attach-file" className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <FileUp size={28} />
                    <span className="text-sm font-medium">{attachFile ? attachFile.name : 'Upload reference document'}</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {submitting ? 'Creating…' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Drawer */}
      {showSubmissions && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSubmissions(null)}>
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-900">{showSubmissions.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Student Submissions — {submissions.length} received</p>
              </div>
              <button onClick={() => setShowSubmissions(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingSubs ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No submissions yet</p>
                </div>
              ) : (
                submissions.map(s => (
                  <div key={s.id} className="border border-slate-100 rounded-2xl p-5 space-y-3 hover:border-primary-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{s.student_name}</p>
                        <p className="text-xs text-slate-400">{s.student_email}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                        s.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>{s.status.toUpperCase()}</span>
                    </div>
                    {s.notes && <p className="text-sm text-slate-600 italic">"{s.notes}"</p>}
                    <div className="flex items-center justify-between gap-3">
                      <a href={s.file_url} target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                        <FileText size={14} /> Open Document
                      </a>
                      {s.status === 'graded' ? (
                        <span className="text-sm font-black text-emerald-600">{s.grade}/{showSubmissions.points} pts</span>
                      ) : (
                        gradingId === s.id ? (
                          <div className="flex gap-2 items-center">
                            <input type="number" min="0" max={showSubmissions.points} placeholder="Grade"
                              className="w-20 px-3 py-1.5 border border-slate-200 rounded-xl text-sm outline-none font-bold"
                              value={gradeData.grade} onChange={e => setGradeData(p => ({ ...p, grade: e.target.value }))} />
                            <button onClick={() => handleGrade(s.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">Save</button>
                            <button onClick={() => setGradingId(null)} className="p-1.5 text-slate-300 hover:text-slate-500"><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setGradingId(s.id); setGradeData({ grade: '', feedback: '' }); }}
                            className="text-xs font-bold px-3 py-1.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-500 rounded-xl transition-all">
                            Grade
                          </button>
                        )
                      )}
                    </div>
                    {gradingId === s.id && (
                      <textarea rows={2} placeholder="Feedback (optional)…"
                        className="w-full px-4 py-2 border border-slate-100 rounded-xl text-sm outline-none resize-none"
                        value={gradeData.feedback} onChange={e => setGradeData(p => ({ ...p, feedback: e.target.value }))} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
