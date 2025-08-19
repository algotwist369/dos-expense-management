import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumb = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const getBreadcrumbItems = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbItems = [
      {
        name: 'Home',
        path: '/',
        icon: FaHome
      }
    ];

    pathnames.forEach((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const displayName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbItems.push({
        name: displayName,
        path: path
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <div className="flex items-center">
              <FaChevronRight className={`w-3 h-3 mx-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          )}
          {index === breadcrumbItems.length - 1 ? (
            <span className={`px-3 py-1.5 rounded-lg font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.icon && <item.icon className="inline w-4 h-4 mr-1.5" />}
              {item.name}
            </span>
          ) : (
            <Link
              to={item.path}
              className={`px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {item.icon && <item.icon className="inline w-4 h-4 mr-1.5" />}
              {item.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
