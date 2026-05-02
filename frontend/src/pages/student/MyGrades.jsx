import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, TrendingUp, BookOpen, AlertCircle, 
  MessageSquare, Calendar, Star, Loader2,
  ChevronDown, ChevronUp, Download, PieChart
} from 'lucide-react';
import studentService from '../../services/studentService';

const MyGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await studentService.getGrades();
        setGrades(data);
      } catch (error) {
        console.error("Failed to load grades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const stats = useMemo(() => {
    if (grades.length === 0) return { avg: 0, total: 0, highest: 0 };
    const totalPoints = grades.reduce((acc, curr) => acc + Number(curr.grade), 0);
    const maxPoints = grades.reduce((acc, curr) => acc + Number(curr.total_points), 0);
    const avg = ((totalPoints / maxPoints) * 100).toFixed(1);
    const highest = Math.max(...grades.map(g => (g.grade / g.total_points) * 100)).toFixed(1);
    return { avg, total: grades.length, highest };
  }, [grades]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Performance</h1>
          <p className="text-slate-500 font-medium mt-1">Review your scores and feedback from teachers.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <StatCard icon={PieChart} label="Average Score" value={`${stats.avg}%`} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={Star} label="Best Performance" value={`${stats.highest}%`} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={Award} label="Graded Tasks" value={stats.total} color="text-amber-600" bg="bg-amber-50" />
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <BookOpen size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">No grades yet</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">
            Once your teachers finish grading your assignments, your scores and feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {grades.map((item) => (
            <GradeItem 
              key={item.id} 
              item={item} 
              isExpanded={expandedId === item.id} 
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`px-6 py-4 rounded-3xl ${bg} flex items-center gap-4 border border-white shadow-sm`}>
    <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${color} shadow-sm`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

const GradeItem = ({ item, isExpanded, onToggle }) => {
  const percentage = ((item.grade / item.total_points) * 100).toFixed(0);
  
  const getStatusColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 70) return 'text-indigo-600 bg-indigo-50';
    if (pct >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const statusCls = getStatusColor(percentage);

  return (
    <div className={`
      bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden
      ${isExpanded ? 'border-indigo-100 shadow-xl' : 'border-slate-50 shadow-sm hover:border-slate-200'}
    `}>
      <div 
        className="p-6 md:p-8 cursor-pointer flex items-center justify-between gap-6"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6 min-w-0">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${statusCls}`}>
            <span className="text-xl">{percentage}%</span>
          </div>
          
          <div className="min-w-0">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{item.course_title}</p>
            <h3 className="text-xl font-black text-slate-900 truncate">{item.assignment_title}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><User size={13} /> {item.teacher_name}</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Graded {new Date(item.graded_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Raw Score</span>
            <span className="text-lg font-black text-slate-700">{item.grade} <span className="text-slate-300 font-medium">/ {item.total_points}</span></span>
          </div>
          <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50 rounded-[1.5rem] p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Feedback Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <MessageSquare size={18} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Teacher Feedback</h4>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed italic">
                  "{item.feedback || "No specific feedback provided for this task."}"
                </p>
              </div>

              {/* Submission Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <BookOpen size={18} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Submission File</h4>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Submitted Document</span>
                  </div>
                  <a 
                    href={item.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-400 transition-all"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Score Visualization Bar */}
            <div className="pt-6 border-t border-slate-200/60">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Score Distribution</span>
                <span className="text-sm font-black text-indigo-600">{percentage}% Achievement</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div className={`h-full rounded-full transition-all duration-1000 ${statusCls.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGrades;