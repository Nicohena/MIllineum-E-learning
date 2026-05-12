import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import notificationService from '../../services/notificationService';

const getIcon = (type) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="text-indigo-500" size={16} />;
    case 'forum_reply':
      return <BookOpen className="text-emerald-500" size={16} />;
    case 'assignment_graded':
    case 'grade':
      return <Award className="text-amber-500" size={16} />;
    case 'assignment':
      return <CheckCircle2 className="text-blue-500" size={16} />;
    default:
      return <Bell className="text-slate-400" size={16} />;
  }
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const DashboardNotifications = ({ compact = false }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications((data.notifications || []).slice(0, compact ? 3 : 5));
      setUnreadCount(Number(data.unread_count || 0));
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => prev.map(item =>
        item.id === notification.id ? { ...item, is_read: 1 } : item
      ));
      setUnreadCount(count => Math.max(0, count - 1));
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(item => ({ ...item, is_read: 1 })));
    setUnreadCount(0);
  };

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-800">Recent Notifications</h3>
            <p className="text-xs font-medium text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
          <Bell size={28} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex w-full gap-3 rounded-2xl border p-4 text-left transition-all hover:border-indigo-100 hover:bg-indigo-50/40 ${
                !notification.is_read ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-white'
              }`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!notification.is_read ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                {getIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`truncate text-sm ${!notification.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                    {notification.title}
                  </p>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">{notification.content}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Link
        to="/notifications"
        className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-50 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        View All Notifications
      </Link>
    </div>
  );
};

export default DashboardNotifications;
