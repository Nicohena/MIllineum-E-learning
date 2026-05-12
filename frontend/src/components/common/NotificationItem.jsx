import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      assignment: 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100',
      announcement: 'bg-purple-50 border-l-4 border-purple-500 hover:bg-purple-100',
      grade: 'bg-green-50 border-l-4 border-green-500 hover:bg-green-100',
      message: 'bg-yellow-50 border-l-4 border-yellow-500 hover:bg-yellow-100',
      course: 'bg-indigo-50 border-l-4 border-indigo-500 hover:bg-indigo-100',
      attendance: 'bg-orange-50 border-l-4 border-orange-500 hover:bg-orange-100',
      default: 'bg-gray-50 border-l-4 border-gray-500 hover:bg-gray-100'
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

  const isRead = notification.is_read === 1 || notification.is_read === true;

  return (
    <div
      className={`p-4 cursor-pointer transition-all duration-200 ${getTypeColor(notification.type)} ${
        !isRead ? 'shadow-sm' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0 mt-1">
              {getTypeIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-sm text-gray-900 truncate ${
                  !isRead ? 'font-bold' : ''
                }`}>
                  {notification.title}
                </h3>
                {!isRead && (
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                )}
              </div>
              <p className={`text-sm mt-1 line-clamp-2 ${
                isRead ? 'text-gray-600' : 'text-gray-800 font-medium'
              }`}>
                {notification.content}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500">
                  {formatDate(notification.created_at)}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  isRead 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-blue-200 text-blue-800 font-semibold'
                }`}>
                  {isRead ? 'Read' : 'New'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {!isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-gray-400 hover:text-blue-600 p-1 text-lg"
              title="Mark as read"
            >
              ✓
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-gray-400 hover:text-red-600 p-1 text-lg"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
