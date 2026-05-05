import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  Users,
  Award,
  X,
  Zap
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import assignmentService from '../../services/assignmentService';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div 
    onClick={onClick}
    className="glass p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-all group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
    <ChevronRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const getDueStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: 'Overdue', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: AlertCircle };
  if (daysLeft === 0) return { label: 'Due Today', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Timer };
  if (daysLeft <= 2) return { label: `${daysLeft}d left`, color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
  return { label: `${daysLeft}d left`, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Calendar };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Assignment due soon', message: 'Check your latest pending work.', time: 'Just now', read: false },
    { id: 2, title: 'New course material available', message: 'Your teacher uploaded new content.', time: 'Today', read: true },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, assignmentData] = await Promise.all([
          studentService.getSchedule(),
          assignmentService.getStudentAssignments()
        ]);
        setCourses(courseData.schedule || []);
        setAssignments(assignmentData || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;
  
  const upcomingDeadlines = assignments
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const achievementBadges = [
    { icon: Flame, label: '7 Day Streak', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { icon: Target, label: 'Quiz Master', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { icon: Zap, label: 'Fast Learner', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [courseData, assignmentData] = await Promise.all([
        studentService.getSchedule(),
        assignmentService.getStudentAssignments()
      ]);
      setCourses(courseData.schedule || []);
      setAssignments(assignmentData || []);
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header with Notifications */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your learning journey today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw size={20} className={`text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fadeInDown">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                      <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={BookOpen} 
          label="My Subjects" 
          value={courses.length} 
          color="bg-indigo-100 text-indigo-600"
          onClick={() => navigate('/student/courses')}
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Graded Tasks" 
          value={gradedCount} 
          color="bg-emerald-100 text-emerald-600"
          onClick={() => navigate('/student/grades')}
        />
        <StatCard 
          icon={Clock} 
          label="Pending Tasks" 
          value={pendingCount} 
          color="bg-amber-100 text-amber-600"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard 
          icon={Flame} 
          label="Study Streak" 
          value="4 days" 
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">My Subjects</h3>
                <p className="text-sm text-slate-500">Access your learning materials</p>
              </div>
              <Link to="/student/courses" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course, idx) => (
                <div 
                  key={idx} 
                  onClick={() => course.course_id && navigate(`/student/course/${course.course_id}`)}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{course.subject_name}</h4>
                      <p className="text-xs text-slate-400 font-bold">{course.teacher_name}</p>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">No courses assigned to your class yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Upcoming Deadlines */}
        <div className="space-y-6">
          <Card variant="white" padding="lg" className="rounded-[2rem]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Upcoming Deadlines</h3>
                <p className="text-xs text-slate-500 font-medium">Don't miss these tasks</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-bold text-slate-700">All caught up! 🎉</p>
                  <p className="text-xs text-slate-400 mt-1">No pending assignments</p>
                </div>
              ) : (
                upcomingDeadlines.map((assignment) => {
                  const status = getDueStatus(assignment.due_date);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={assignment.id} className="group p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => navigate('/student/assignments')}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{assignment.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${status.color}`}>
                              <StatusIcon size={10} /> {status.label}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Link 
              to="/student/assignments" 
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-all"
            >
              View All Assignments
            </Link>
          </Card>

          {/* Quick Stats Summary */}
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles size={24} className="text-indigo-200 mb-4" />
              <h3 className="text-xl font-black mb-2">Keep it up!</h3>
              <p className="text-indigo-100 text-sm font-medium mb-4">You have completed {gradedCount} assignments so far.</p>
              <div className="h-2 w-full bg-indigo-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (gradedCount / (pendingCount + gradedCount || 1)) * 100)}%` }}></div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Target size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="white" padding="lg" className="rounded-[2rem]">
        <h3 className="font-black text-slate-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/help')} className="p-4 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 transition-colors group">
            <MessageSquare size={18} className="text-indigo-600 mb-2" />
            <p className="font-bold text-slate-700 text-xs">Help Center</p>
            <p className="text-[10px] text-slate-400 mt-1">Contact Support</p>
          </button>
          <button onClick={() => navigate('/student/assignments')} className="p-4 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 transition-colors group">
            <Target size={18} className="text-indigo-600 mb-2" />
            <p className="font-bold text-slate-700 text-xs">Assignments</p>
            <p className="text-[10px] text-slate-400 mt-1">Submit Tasks</p>
          </button>
          <button onClick={() => navigate('/student/grades')} className="p-4 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 transition-colors group">
            <Award size={18} className="text-indigo-600 mb-2" />
            <p className="font-bold text-slate-700 text-xs">My Grades</p>
            <p className="text-[10px] text-slate-400 mt-1">View Results</p>
          </button>
          <button onClick={() => navigate('/profile')} className="p-4 bg-slate-50 rounded-2xl text-left hover:bg-indigo-50 transition-colors group">
            <Users size={18} className="text-indigo-600 mb-2" />
            <p className="font-bold text-slate-700 text-xs">Profile</p>
            <p className="text-[10px] text-slate-400 mt-1">Manage Account</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
