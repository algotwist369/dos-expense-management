import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaHeart, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bottom Bar */}
        <div className={`border-t mt-8 pt-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © {currentYear} Disha Online Solution. All rights reserved.
            </p>
            <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Made with <FaHeart className="text-red-500 mx-1" /> by the DOS Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
