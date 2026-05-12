import React, { useEffect, useMemo, useState } from 'react';
import {
  Award, BarChart3, CheckCircle2, Clock, Eye, HelpCircle, Loader2,
  Plus, Trash2, X
} from 'lucide-react';
import quizService from '../../services/quizService';
import teacherService from '../../services/teacherService';

const blankQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correct_index: 0,
  points: 1,
});

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    time_limit_minutes: 15,
    questions: [blankQuestion()],
  });

  const minDueDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [quizData, courseData] = await Promise.all([
        quizService.getMyQuizzes(),
        teacherService.getCourses(),
      ]);
      setQuizzes(quizData);
      setCourses(courseData || []);
    } catch {
      showToast('Failed to load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: quizzes.length,
    attempts: quizzes.reduce((sum, quiz) => sum + Number(quiz.attempt_count || 0), 0),
    average: quizzes.length
      ? Math.round(quizzes.reduce((sum, quiz) => sum + Number(quiz.average_score || 0), 0) / quizzes.length)
      : 0,
  }), [quizzes]);

  const updateQuestion = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => i === index ? { ...question, [field]: value } : question),
    }));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => i === questionIndex
        ? { ...question, options: question.options.map((option, j) => j === optionIndex ? value : option) }
        : question),
    }));
  };

  const addQuestion = () => setForm(prev => ({ ...prev, questions: [...prev.questions, blankQuestion()] }));

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.length === 1 ? prev.questions : prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await quizService.createQuiz(form);
      setShowCreate(false);
      setForm({ course_id: '', title: '', description: '', due_date: '', time_limit_minutes: 15, questions: [blankQuestion()] });
      showToast('Quiz published');
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAttempts = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoadingAttempts(true);
    try {
      setAttempts(await quizService.getAttempts(quiz.id));
    } catch {
      showToast('Could not load attempts', 'error');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all attempts?')) return;
    try {
      await quizService.deleteQuiz(id);
      showToast('Quiz deleted');
      await load();
    } catch {
      showToast('Failed to delete quiz', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Interactive Quizzes</h1>
          <p className="text-slate-500 mt-1 font-medium">Build multiple-choice quizzes and review auto-graded attempts.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-200 w-max active:scale-95">
          <Plus size={20} /> New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Quizzes', value: stats.total, icon: HelpCircle, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Attempts', value: stats.attempts, icon: Award, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Average', value: `${stats.average}%`, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
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

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
          <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No quizzes yet</h3>
          <p className="text-slate-400 mt-2 font-medium">Create a quiz to give students an interactive check for understanding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all p-6 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{quiz.course_title}</span>
                <h3 className="text-lg font-black text-slate-900 mt-1 leading-tight">{quiz.title}</h3>
                {quiz.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{quiz.description}</p>}
              </div>
              <div className="flex gap-4 text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Clock size={13} />{quiz.time_limit_minutes} min</span>
                <span>{quiz.attempt_count} attempts</span>
                <span className="ml-auto">{Math.round(Number(quiz.average_score || 0))}% avg</span>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button onClick={() => openAttempts(quiz)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  <Eye size={16} /> Attempts
                </button>
                <button onClick={() => handleDelete(quiz.id)}
                  className="p-2.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create Quiz</h2>
                <p className="text-sm text-slate-500 mt-1">Students answer in the browser and receive an automatic score.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={22} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-5 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Title" required value={form.title} onChange={value => setForm(p => ({ ...p, title: value }))} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
                  <select required value={form.course_id} onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
                    <option value="">Select course...</option>
                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                  </select>
                </div>
                <Input label="Due Date" required type="datetime-local" min={minDueDate} value={form.due_date} onChange={value => setForm(p => ({ ...p, due_date: value }))} />
                <Input label="Time Limit" type="number" min="1" value={form.time_limit_minutes} onChange={value => setForm(p => ({ ...p, time_limit_minutes: value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none text-slate-700 resize-none" />
              </div>

              <div className="space-y-4">
                {form.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-slate-100 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 font-black flex items-center justify-center">{qIndex + 1}</span>
                      <input required placeholder="Question text" value={question.text}
                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                      <input type="number" min="1" value={question.points}
                        onChange={e => updateQuestion(qIndex, 'points', e.target.value)}
                        className="w-20 px-3 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" />
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
                          <input type="radio" name={`correct-${qIndex}`} checked={Number(question.correct_index) === optionIndex}
                            onChange={() => updateQuestion(qIndex, 'correct_index', optionIndex)} />
                          <input required placeholder={`Option ${optionIndex + 1}`} value={option}
                            onChange={e => updateOption(qIndex, optionIndex, e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-primary-200 hover:text-primary-700 rounded-2xl font-bold text-slate-500">
                Add Question
              </button>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {saving ? 'Publishing...' : 'Publish Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedQuiz(null)}>
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedQuiz.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Quiz Attempts</p>
              </div>
              <button onClick={() => setSelectedQuiz(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingAttempts ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
              ) : attempts.length === 0 ? (
                <p className="text-center py-16 text-slate-400 font-bold">No attempts yet</p>
              ) : attempts.map(attempt => (
                <div key={attempt.id} className="border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800">{attempt.student_name}</p>
                    <p className="text-xs text-slate-400">{attempt.student_email}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(attempt.submitted_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary-700">{Math.round(Number(attempt.percentage))}%</p>
                    <p className="text-xs font-bold text-slate-400">{attempt.score}/{attempt.total_points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input value={value} onChange={event => onChange(event.target.value)}
      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700" {...props} />
  </div>
);

export default TeacherQuizzes;
