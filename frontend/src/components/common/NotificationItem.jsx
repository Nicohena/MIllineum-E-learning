import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      assignment: 'bg-blue-100 border-l-4 border-blue-500',
      announcement: 'bg-purple-100 border-l-4 border-purple-500',
      grade: 'bg-green-100 border-l-4 border-green-500',
      message: 'bg-yellow-100 border-l-4 border-yellow-500',
      course: 'bg-indigo-100 border-l-4 border-indigo-500',
      attendance: 'bg-orange-100 border-l-4 border-orange-500',
      default: 'bg-gray-100 border-l-4 border-gray-500'
    };
    return colors[type] || colors.default;
  };

  const getTypeIcon = (type) => {
    const icons = {
      assignment: '📝',
      announcement: '📢',
      grade: '📊',
      message: '💬',
      course: '📚',
      attendance: '✓',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getTypeColor(notification.type)} ${
        !notification.is_read ? 'font-semibold' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0">
              {getTypeIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                {notification.content}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(notification.created_at)}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="text-gray-400 hover:text-red-600 flex-shrink-0 p-1"
          title="Delete"
        >
          ✕
        </button>
      </div>
      
      {!notification.is_read && (
        <div className="mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};

export default NotificationItem;
