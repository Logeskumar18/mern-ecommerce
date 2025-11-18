import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const { user } = useContext(AuthContext);
  const themeContext = useThemeContext();

  useEffect(() => {
    // Remove existing theme classes
    document.body.classList.remove('admin-theme', 'customer-theme', 'light-theme', 'dark-theme');
    
    // Add appropriate role theme class
    if (user && user.role === 'admin') {
      document.body.classList.add('admin-theme');
    } else {
      document.body.classList.add('customer-theme');
    }

    // Add light/dark theme class
    document.body.classList.add(themeContext.isDarkMode ? 'dark-theme' : 'light-theme');

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('admin-theme', 'customer-theme', 'light-theme', 'dark-theme');
    };
  }, [user, themeContext.isDarkMode]);

  return {
    ...themeContext,
    theme: user && user.role === 'admin' ? 'admin' : 'customer',
    isAdmin: user && user.role === 'admin'
  };
};