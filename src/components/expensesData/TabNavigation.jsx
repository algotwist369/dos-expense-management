import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "",
  showBadges = true,
  disabled = false 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex rounded-xl shadow-md p-2 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && !disabled && onTabChange(tab.id)}
          disabled={tab.disabled || disabled}
          className={`flex-1 px-6 py-4 font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 relative ${
            tab.disabled || disabled
              ? "opacity-50 cursor-not-allowed"
              : activeTab === tab.id
                ? isDarkMode
                  ? "text-blue-400 bg-blue-900/50"
                  : "text-blue-600 bg-blue-50"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500"
          }`}
          title={tab.description || tab.label}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {showBadges && tab.badge && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
