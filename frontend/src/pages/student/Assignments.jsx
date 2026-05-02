import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CheckCircle2, AlertCircle, Clock, Award, Download,
  Filter, Search, X, Calendar, Loader2, UploadCloud
} from 'lucide-react';
import assignmentService from '../../services/assignmentService';

const statusConfig = {
  null: { label: 'Pending', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-100', Icon: AlertCircle, iconCls: 'text-amber-500' },
  pending: { label: 'Pending', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-100', Icon: AlertCircle, iconCls: 'text-amber-500' },
  submitted: { label: 'Submitted', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-100', Icon: Clock, iconCls: 'text-blue-500' },
  graded: { label: 'Graded', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-100', Icon: CheckCircle2, iconCls: 'text-emerald-500' },
};

const getDueInfo = (dueDate) => {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  if (diff < 0) return { text: 'Overdue', cls: 'text-red-600' };
  if (diff === 0) return { text: 'Due today', cls: 'text-amber-600' };
  if (diff === 1) return { text: 'Due tomorrow', cls: 'text-amber-600' };
  return { text: `${diff} days left`, cls: 'text-slate-500' };
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null); // for submission modal
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await assignmentService.getStudentAssignments();
      setAssignments(data);
    } catch {
      showToast('Could not load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const status = a.submission_status || 'pending';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [assignments, filterStatus, searchTerm]);

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => !a.submission_status || a.submission_status === 'pending').length,
    submitted: assignments.filter(a => a.submission_status === 'submitted').length,
    graded: assignments.filter(a => a.submission_status === 'graded').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { showToast('Please select a file', 'error'); return; }
    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(selected.id, selectedFile, notes);
      showToast('Assignment submitted successfully!');
      setSelected(null); setSelectedFile(null); setNotes('');
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
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
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Assignments</h1>
        <p className="text-slate-500 mt-1 font-medium">Submit your work as a document for each task below.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-600' },
          { label: 'Submitted', value: stats.submitted, color: 'bg-blue-50 text-blue-600' },
          { label: 'Graded', value: stats.graded, color: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5`}>
            <p className="text-3xl font-black">{value}</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by title or course…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 appearance-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {/* Assignments */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const status = a.submission_status || 'pending';
            const cfg = statusConfig[status] || statusConfig.pending;
            const due = getDueInfo(a.due_date);

            return (
              <div key={a.id} className={`bg-white border-2 ${cfg.borderClass} rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-lg transition-all group`}>
                <div className={`p-3 rounded-2xl ${cfg.bgClass} shrink-0`}>
                  <cfg.Icon size={28} className={cfg.iconCls} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{a.course_title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${cfg.bgClass} ${cfg.textClass}`}>{cfg.label}</span>
                    {a.grade && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-50 text-emerald-600 flex items-center gap-1">
                        <Award size={10} /> {a.grade}/{a.points} pts
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">{a.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={13} />
                      {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`flex items-center gap-1 ${due.cls}`}><Clock size={13} />{due.text}</span>
                    <span>{a.points} points</span>
                    <span>by {a.teacher_name}</span>
                  </div>
                  {a.feedback && (
                    <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2 font-medium">
                      💬 Teacher feedback: {a.feedback}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {a.attachment_url && (
                    <a href={a.attachment_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                      <Download size={16} /> Reference
                    </a>
                  )}
                  {status === 'pending' && (
                    <button
                      onClick={() => { setSelected(a); setSelectedFile(null); setNotes(''); }}
                      className="flex items-center gap-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-5 py-2.5 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95"
                    >
                      <UploadCloud size={16} /> Submit Work
                    </button>
                  )}
                  {status === 'submitted' && (
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">Awaiting grade</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Submit Work</h2>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-3xl p-8 text-center transition-colors cursor-pointer">
                <input type="file" id="submission-file" className="hidden"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={e => setSelectedFile(e.target.files[0])} />
                <label htmlFor="submission-file" className="flex flex-col items-center gap-3 cursor-pointer">
                  <div className={`p-4 rounded-2xl transition-colors ${selectedFile ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-400'}`}>
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className={`font-bold ${selectedFile ? 'text-primary-700' : 'text-slate-500'}`}>
                      {selectedFile ? selectedFile.name : 'Click to upload your document'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, ZIP accepted</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes to Teacher (optional)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any notes or comments for your teacher…"
                  className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl outline-none text-slate-700 resize-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all" />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setSelected(null)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={submitting || !selectedFile}
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                  {submitting ? 'Submitting…' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;