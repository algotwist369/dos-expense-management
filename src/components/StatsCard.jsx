import React from 'react';
import { useTheme } from '../context/ThemeContext';

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const { isDarkMode } = useTheme();

  const colorClasses = {
    blue: {
      bg: isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10' : 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      border: isDarkMode ? 'border-blue-700/30' : 'border-blue-200/50',
      icon: 'text-blue-600 dark:text-blue-400',
      value: isDarkMode ? 'text-blue-300' : 'text-blue-700',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    green: {
      bg: isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-green-800/10' : 'bg-gradient-to-br from-green-50 to-green-100/50',
      border: isDarkMode ? 'border-green-700/30' : 'border-green-200/50',
      icon: 'text-green-600 dark:text-green-400',
      value: isDarkMode ? 'text-green-300' : 'text-green-700',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    purple: {
      bg: isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/10' : 'bg-gradient-to-br from-purple-50 to-purple-100/50',
      border: isDarkMode ? 'border-purple-700/30' : 'border-purple-200/50',
      icon: 'text-purple-600 dark:text-purple-400',
      value: isDarkMode ? 'text-purple-300' : 'text-purple-700',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    orange: {
      bg: isDarkMode ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/10' : 'bg-gradient-to-br from-orange-50 to-orange-100/50',
      border: isDarkMode ? 'border-orange-700/30' : 'border-orange-200/50',
      icon: 'text-orange-600 dark:text-orange-400',
      value: isDarkMode ? 'text-orange-300' : 'text-orange-700',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`p-6 rounded-2xl border ${classes.bg} ${classes.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${classes.value} tracking-tight`}>
            {value}
          </p>
        </div>
        
        <div className={`w-14 h-14 ${classes.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

