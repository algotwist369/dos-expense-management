import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-t-transparent ${isDarkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      {text && (
        <p className={`mt-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
