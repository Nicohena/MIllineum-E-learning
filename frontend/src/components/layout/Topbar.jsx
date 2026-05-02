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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const notificationsSeed = [
  { id: 1, title: 'Assignment due tomorrow', time: '2h ago', link: '/student/assignments', read: false },
  { id: 2, title: 'New class material uploaded', time: '5h ago', link: '/student/courses', read: false },
  { id: 3, title: 'Grade updated in Web Dev', time: '1d ago', link: '/student/grades', read: true },
];

const quickLinks = [
  { label: 'Dashboard', link: '/dashboard' },
  { label: 'My Learning', link: '/student/courses' },
  { label: 'Assignments', link: '/student/assignments' },
  { label: 'My Grades', link: '/student/grades' },
  { label: 'Messaging', link: '/student/messages' },
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
  const [notifications, setNotifications] = useState(notificationsSeed);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

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

  const unreadCount = notifications.filter((item) => !item.read).length;

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

  const onNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setShowNotifications(false);
    navigate(notification.link);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
              {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  <button
                    onClick={() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNotificationClick(item)}
                      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        !item.read ? 'bg-indigo-50/50' : 'bg-white'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={15} className="text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowProfileMenu(false);
                  }}
                  className="w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <p className="mt-1 text-[11px] font-medium text-indigo-600">Click name to open notifications</p>
                </button>
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Bell size={16} />
                  Notifications
                </button>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/help');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <HelpCircle size={16} />
                  Help Center
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
