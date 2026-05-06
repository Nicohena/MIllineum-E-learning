import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  BookOpen, 
  Award, 
  Clock, 
  Trash2, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import notificationService from '../../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare className="text-indigo-500" size={18} />;
      case 'forum_reply': return <BookOpen className="text-emerald-500" size={18} />;
      case 'assignment_graded': return <Award className="text-amber-500" size={18} />;
      default: return <Bell className="text-slate-400" size={18} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Bell className="w-12 h-12 text-slate-200 animate-bounce" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching updates...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Stay updated with your latest activities and messages.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllRead}
              className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-slate-200" size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">All caught up!</h3>
            <p className="text-slate-400 font-medium mt-1">No new notifications to show.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) handleMarkAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`
                group relative flex items-start gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer
                ${notif.is_read 
                  ? 'bg-white border-slate-50 hover:border-slate-200' 
                  : 'bg-indigo-50/30 border-indigo-100/50 hover:bg-indigo-50/50 hover:border-indigo-200 shadow-sm shadow-indigo-100/20'
                }
              `}
            >
              {!notif.is_read && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" />
              )}
              
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300
                ${notif.is_read ? 'bg-slate-50' : 'bg-white shadow-sm'}
              `}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1 pr-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-black tracking-tight ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                  {notif.content}
                </p>
                
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
        <AlertCircle size={12} />
        Notifications are cleared automatically after 30 days
      </div>
    </div>
  );
};

export default Notifications;
