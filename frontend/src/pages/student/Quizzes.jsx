import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, Award, CheckCircle2, ChevronLeft, ChevronRight, Clock,
  HelpCircle, Loader2, Search, X
} from 'lucide-react';
import quizService from '../../services/quizService';

const getDueInfo = (dueDate) => {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  if (diff < 0) return { text: 'Closed', cls: 'text-red-600', closed: true };
  if (diff === 0) return { text: 'Due today', cls: 'text-amber-600', closed: false };
  if (diff === 1) return { text: 'Due tomorrow', cls: 'text-amber-600', closed: false };
  return { text: `${diff} days left`, cls: 'text-slate-500', closed: false };
};

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      setQuizzes(await quizService.getStudentQuizzes());
    } catch {
      showToast('Could not load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!activeQuiz || result || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeQuiz, result, secondsLeft]);

  useEffect(() => {
    if (activeQuiz && !result && secondsLeft === 0) {
      handleSubmit(true);
    }
  }, [secondsLeft]);

  const filtered = useMemo(() => quizzes.filter(quiz => {
    const status = quiz.attempt_id ? 'completed' : (getDueInfo(quiz.due_date).closed ? 'closed' : 'pending');
    const matchesStatus = filterStatus === 'all' || filterStatus === status;
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [quizzes, filterStatus, searchTerm]);

  const stats = {
    total: quizzes.length,
    pending: quizzes.filter(quiz => !quiz.attempt_id && !getDueInfo(quiz.due_date).closed).length,
    completed: quizzes.filter(quiz => quiz.attempt_id).length,
    average: quizzes.filter(quiz => quiz.attempt_id).length
      ? Math.round(quizzes.filter(quiz => quiz.attempt_id).reduce((sum, quiz) => sum + Number(quiz.percentage || 0), 0) / quizzes.filter(quiz => quiz.attempt_id).length)
      : 0,
  };

  const openQuiz = async (quiz) => {
    try {
      const data = await quizService.getStudentQuiz(quiz.id);
      setActiveQuiz(data);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setSecondsLeft(Number(data.time_limit_minutes || 15) * 60);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Could not open quiz', 'error');
    }
  };

  const closeQuiz = async () => {
    setActiveQuiz(null);
    setResult(null);
    setAnswers({});
    await load();
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!activeQuiz || submitting || result) return;
    if (!autoSubmit && Object.keys(answers).length < activeQuiz.questions.length) {
      const ok = window.confirm('Some questions are unanswered. Submit anyway?');
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      const response = await quizService.submitQuiz(activeQuiz.id, answers);
      setResult(response.result);
      showToast(autoSubmit ? 'Time is up. Quiz submitted.' : 'Quiz submitted');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const activeQuestion = activeQuiz?.questions?.[currentIndex];

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

      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Interactive Quizzes</h1>
        <p className="text-slate-500 mt-1 font-medium">Take quizzes, track your score, and keep your learning moving.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-600' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Average', value: `${stats.average}%`, color: 'bg-blue-50 text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5`}>
            <p className="text-3xl font-black">{value}</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by title or course..."
            value={searchTerm} onChange={event => setSearchTerm(event.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all" />
        </div>
        <select value={filterStatus} onChange={event => setFilterStatus(event.target.value)}
          className="px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-400" size={48} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No quizzes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(quiz => {
            const due = getDueInfo(quiz.due_date);
            const completed = Boolean(quiz.attempt_id);
            return (
              <div key={quiz.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-lg transition-all">
                <div className={`p-3 rounded-2xl shrink-0 ${completed ? 'bg-emerald-50 text-emerald-600' : due.closed ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                  {completed ? <Award size={28} /> : due.closed ? <AlertCircle size={28} /> : <HelpCircle size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.course_title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${completed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {completed ? 'Completed' : due.closed ? 'Closed' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg">{quiz.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={13} />{quiz.time_limit_minutes} min</span>
                    <span className={due.cls}>{due.text}</span>
                    <span>by {quiz.teacher_name}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {completed ? (
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">{Math.round(Number(quiz.percentage))}%</p>
                      <p className="text-xs font-bold text-slate-400">{quiz.score}/{quiz.total_points} pts</p>
                    </div>
                  ) : (
                    <button disabled={due.closed} onClick={() => openQuiz(quiz)}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400">
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/60">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{activeQuiz.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{activeQuiz.description}</p>
              </div>
              <div className="flex items-center gap-4">
                {!result && <span className={`font-black ${secondsLeft < 60 ? 'text-red-600' : 'text-slate-700'}`}>{formatTime(secondsLeft)}</span>}
                <button onClick={closeQuiz} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={22} /></button>
              </div>
            </div>

            {result ? (
              <div className="p-10 text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award size={48} />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900">{Math.round(Number(result.percentage))}%</h3>
                  <p className="text-slate-500 font-bold mt-1">{result.score} out of {result.total_points} points</p>
                </div>
                <button onClick={closeQuiz}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200">
                  Back to Quizzes
                </button>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {activeQuiz.questions.map((question, index) => (
                    <button key={question.id} onClick={() => setCurrentIndex(index)}
                      className={`w-10 h-10 rounded-xl font-black text-sm ${
                        currentIndex === index
                          ? 'bg-primary-600 text-white'
                          : answers[question.id] !== undefined
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-50 text-slate-400'
                      }`}>
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="border border-slate-100 rounded-3xl p-6">
                  <p className="text-xs font-black text-primary-500 uppercase tracking-widest mb-3">
                    Question {currentIndex + 1} of {activeQuiz.questions.length}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900">{activeQuestion.text}</h3>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeQuestion.options.map((option, optionIndex) => {
                      const selected = Number(answers[activeQuestion.id]) === optionIndex;
                      return (
                        <button key={optionIndex} type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [activeQuestion.id]: optionIndex }))}
                          className={`text-left p-4 rounded-2xl border-2 transition-all font-bold ${
                            selected
                              ? 'border-primary-500 bg-primary-50 text-primary-800'
                              : 'border-slate-100 bg-white hover:border-primary-100 text-slate-700'
                          }`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex(index => index - 1)}
                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 rounded-2xl font-bold text-slate-600 flex items-center gap-2">
                    <ChevronLeft size={18} /> Previous
                  </button>
                  {currentIndex === activeQuiz.questions.length - 1 ? (
                    <button type="button" disabled={submitting} onClick={() => handleSubmit(false)}
                      className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-2 disabled:opacity-60">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Submit Quiz
                    </button>
                  ) : (
                    <button type="button" onClick={() => setCurrentIndex(index => index + 1)}
                      className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center gap-2">
                      Next <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
