import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import NotificationItem from './NotificationItem';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchStats();
    }
  }, [isOpen]);

  const fetchNotifications = async (type = 'all') => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (type === 'all') {
        response = await notificationService.getNotifications();
      } else {
        response = await notificationService.getNotificationsByType(type);
      }
      
      if (response.status === 'success') {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unread_count || 0);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      if (response.status === 'success') {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    fetchNotifications(filter);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: 1 } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      
      // Update stats
      fetchStats();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      fetchStats();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      fetchStats();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await notificationService.deleteAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
        fetchStats();
      } catch (err) {
        console.error('Error deleting all notifications:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount}
                </span>
                <span className="text-sm text-blue-100">unread</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{stats.unread || 0}</div>
              <div className="text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{stats.assignments || 0}</div>
              <div className="text-gray-600">Assign.</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white border-b px-2 py-2 flex gap-1 overflow-x-auto">
          {['all', 'assignment', 'announcement', 'grade', 'message'].map(filter => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="bg-gray-100 px-4 py-2 border-b flex gap-2 justify-end">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
