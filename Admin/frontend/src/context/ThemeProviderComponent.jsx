import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const getInitialMode = () => {
    try {
      return localStorage.getItem('theme');
    } catch {
      return 'light';
    }
  };

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key === 'theme') {
        setMode(event.newValue || 'light');
      }
    };
    window.addEventListener('storage', syncTheme);
    return () => {
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      localStorage.setItem('theme', newMode);
    } catch {
      console.warn('Could not save theme to localStorage.');
    }
  },[mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;