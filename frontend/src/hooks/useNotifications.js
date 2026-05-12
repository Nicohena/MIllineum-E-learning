import { useState, useCallback } from 'react';
import notificationService from '../services/notificationService';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (type = 'all') => {
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
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationStats();
      if (response.status === 'success') {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [fetchStats]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, [fetchStats]);

  const markReadBatch = useCallback(async (ids) => {
    try {
      await notificationService.markReadBatch(ids);
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.id) ? { ...n, is_read: 1 } : n))
      );
      const markedCount = notifications.filter(
        n => ids.includes(n.id) && !n.is_read
      ).length;
      setUnreadCount(prev => Math.max(0, prev - markedCount));
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error marking batch as read:', err);
      return false;
    }
  }, [notifications, fetchStats]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications, fetchStats]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      return false;
    }
  }, [fetchStats]);

  const sendNotification = useCallback(
    async (recipientId, type, title, content, options = {}) => {
      try {
        const response = await notificationService.sendNotification(
          recipientId,
          type,
          title,
          content,
          options
        );
        if (response.status === 'success') {
          return { success: true, data: response };
        }
        return { success: false, error: response.error };
      } catch (err) {
        console.error('Error sending notification:', err);
        return { success: false, error: err.message };
      }
    },
    []
  );

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    markReadBatch,
    deleteNotification,
    deleteAllNotifications,
    sendNotification
  };
};

export default useNotifications;
