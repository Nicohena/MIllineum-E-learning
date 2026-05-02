import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Plus, BarChart, BookOpen, ChevronRight, 
  Clock, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import assignmentService from '../../services/assignmentService';
import { Link, useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, submissionData] = await Promise.all([
          teacherService.getCourses(),
          assignmentService.getRecentSubmissions()
        ]);
        setCourses(courseData);
        setRecentSubmissions(submissionData);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingGradingCount = recentSubmissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Instructor Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Hello, Prof. {user?.name?.split(' ')[0]}. Manage your curriculum and student progress.</p>
        </div>
        <button 
          onClick={() => navigate('/teacher/assignments')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-[1.5rem] transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Create Assignment
        </button>
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookOpen} label="My Courses" value={courses.length} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={Users} label="Active Students" value="34" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard 
          icon={AlertCircle} 
          label="Pending Grading" 
          value={pendingGradingCount} 
          color="text-amber-600" 
          bg="bg-amber-50" 
          highlight={pendingGradingCount > 0}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800">Your Active Courses</h2>
            <Link to="/teacher/courses" className="text-indigo-600 text-sm font-bold hover:underline">View All</Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex justify-center items-center">
                 <Clock className="animate-spin text-indigo-600" />
              </div>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 flex items-center justify-between group hover:border-indigo-100 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <BookOpen size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight">{course.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{course.class_name || 'General Enrollment'}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/teacher/course/${course.id}/edit`}
                    className="p-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl text-slate-400 transition-all"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                 <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-500 font-medium">You don't have any courses assigned yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm relative overflow-hidden">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                Recent Submissions
              </h3>
              
              <div className="space-y-6">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((sub, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${sub.status === 'submitted' ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'}`}></div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{sub.assignment_title}</p>
                        <p className="text-xs text-slate-500 font-medium">From {sub.student_name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-medium text-center py-4 italic">No recent submissions to review.</p>
                )}
                <button 
                  onClick={() => navigate('/teacher/assignments')}
                  className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-slate-100"
                >
                  OPEN GRADEBOOK
                </button>
              </div>
           </div>

           {/* Quick Stats Summary */}
           <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <BarChart size={20} />
                </div>
                <h4 className="font-black text-slate-800">Quick Stats</h4>
             </div>
             <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
               Your students are maintaining an average score of <span className="text-indigo-600 font-black text-lg">78%</span> this month.
             </p>
             <div className="h-2 w-full bg-indigo-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '78%' }}></div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg, highlight }) => (
  <div className={`bg-white p-7 rounded-[2.5rem] border ${highlight ? 'border-amber-200 shadow-amber-100 shadow-xl' : 'border-slate-50 shadow-sm'} transition-all`}>
     <div className="flex justify-between items-start mb-6">
        <div className={`p-4 ${bg} ${color} rounded-2xl shadow-sm`}><Icon size={24} /></div>
     </div>
     <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{label}</p>
     <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

export default TeacherDashboard;
