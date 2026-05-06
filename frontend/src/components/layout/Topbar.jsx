/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  BookOpen,
  Award,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const quickLinks = [
  { label: 'Dashboard', link: '/dashboard' },
  { label: 'My Learning', link: '/student/courses' },
  { label: 'Assignments', link: '/student/assignments' },
  { label: 'My Grades', link: '/student/grades' },
  { label: 'Messaging', link: '/student/messages' },
  { label: 'Forum', link: '/student/forum' },
  { label: 'Profile', link: '/profile' },
  { label: 'Help Center', link: '/help' },
];

export const Topbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredLinks = useMemo(() => {
    if (query.trim().length < 2) return [];
    return quickLinks.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/courses')) return 'Courses';
    if (path.includes('/assignments')) return 'Assignments';
    if (path.includes('/grades')) return 'Grades';
    if (path.includes('/messages') || path.includes('/forum')) return 'Communication';
    if (path.includes('/admin')) return 'Administration';
    if (path.includes('/teacher')) return 'Instructor Panel';
    return 'Millennium E-learning';
  }, [location.pathname]);

  const roleLabel = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'User';

  const onNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      fetchNotifications();
    }
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare className="text-indigo-500" size={14} />;
      case 'forum_reply': return <BookOpen className="text-emerald-500" size={14} />;
      case 'assignment_graded': return <Award className="text-amber-500" size={14} />;
      default: return <Bell className="text-slate-400" size={14} />;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:block">
            <p className="text-lg font-semibold text-slate-800">{pageTitle}</p>
            <p className="text-xs text-slate-500">{roleLabel} workspace</p>
          </div>
        </div>

        <div className="relative hidden w-full max-w-xl md:block" ref={searchRef}>
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            type="text"
            placeholder="Search pages..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />

          {showSearch && filteredLinks.length > 0 && (
            <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {filteredLinks.map((item) => (
                <button
                  key={item.link}
                  onClick={() => {
                    navigate(item.link);
                    setShowSearch(false);
                    setQuery('');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 bg-slate-50/50">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center px-6">
                      <Bell className="mx-auto text-slate-200 mb-2" size={24} />
                      <p className="text-xs font-bold text-slate-400">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNotificationClick(item)}
                        className={`w-full border-b border-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-50 flex gap-3 ${
                          !item.is_read ? 'bg-indigo-50/30' : 'bg-white'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!item.is_read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs tracking-tight truncate ${!item.is_read ? 'font-black text-slate-900' : 'font-medium text-slate-600'}`}>
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.content}</p>
                          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button 
                  onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                  className="w-full py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-xs font-bold text-white shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={15} className="text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="border-b border-slate-100 px-4 py-4 bg-slate-50/50">
                  <p className="truncate text-xs font-black text-slate-900">{user?.name}</p>
                  <p className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user?.role}</p>
                </div>
                <div className="p-1">
                  {[
                    { label: 'Notifications', icon: Bell, link: '/notifications' },
                    { label: 'My Profile', icon: User, link: '/profile' },
                    { label: 'Settings', icon: Settings, link: '/settings' },
                    { label: 'Help Center', icon: HelpCircle, link: '/help' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.link);
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 transition rounded-xl hover:bg-slate-50 hover:text-slate-900"
                    >
                      <item.icon size={16} className="text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-slate-50 mt-1 px-4 py-2.5 text-xs font-black text-rose-500 transition rounded-xl hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
