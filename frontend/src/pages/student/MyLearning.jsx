import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, User, Clock, ChevronRight, 
  Search, Filter, Book, GraduationCap,
  Calendar, Loader2, AlertCircle
} from 'lucide-react';
import studentService from '../../services/studentService';

const MyLearning = () => {
  const [schedule, setSchedule] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [academicYear, setAcademicYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const data = await studentService.getSchedule();
        setSchedule(data.schedule || []);
        setClassInfo(data.class);
        setAcademicYear(data.academic_year);
      } catch (error) {
        console.error("Failed to load learning data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningData();
  }, []);

  const filteredSchedule = schedule.filter(item => 
    item.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Preparing your learning workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <GraduationCap size={14} />
            Academic Year {academicYear}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Learning</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here are the subjects for <span className="text-indigo-600 font-bold">{classInfo?.name || 'your class'}</span>.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search subjects or teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm group-hover:border-slate-200"
          />
        </div>
      </div>

      {!classInfo ? (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-amber-500">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Class Assignment Pending</h3>
          <p className="text-slate-600 max-w-md mx-auto font-medium">
            You haven't been assigned to a specific class section yet. Please contact the administration to get access to your subjects.
          </p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
          <Book className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No subjects found</h3>
          <p className="text-slate-500 font-medium">There are no courses assigned to your class yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedule.map((course, idx) => (
            <div 
              key={idx}
              onClick={() => course.course_id && navigate(`/student/course/${course.course_id}`)}
              className={`group bg-white rounded-[2.5rem] p-7 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden ${!course.course_id ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
            >
              {/* Decorative Background Blob */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 blur-2xl opacity-50"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                    <BookOpen size={28} />
                  </div>
                  {!course.course_id && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {course.subject_name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                    <User size={14} className="text-indigo-400" />
                    <span>{course.teacher_name}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Format</span>
                      <span className="font-bold text-slate-700">Digital Notes</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats / Info Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Today is</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Subjects</p>
            <p className="text-sm font-black text-slate-800">{schedule.length} Enrolled</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Time</p>
            <p className="text-sm font-black text-slate-800">2.5 Hours / Avg</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;