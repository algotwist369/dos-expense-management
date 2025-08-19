import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const NotificationBadge = () => {
  const { isDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Expense Added',
      message: 'Your expense has been successfully recorded.',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Budget Alert',
      message: 'You are approaching your monthly budget limit.',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to the expense tracker.',
      time: '3 hours ago'
    }
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      default:
        return <FaInfoCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
      case 'error':
        return isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200';
      default:
        return isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`p-2 rounded-lg transition-colors duration-200 relative ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        <FaBell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {notifications.length}
        </span>
      </button>

      {showNotifications && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications ({notifications.length})
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b ${getTypeStyles(notification.type)} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              className={`w-full text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default NotificationBadge;
