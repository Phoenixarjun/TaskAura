import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      className="theme-toggle-btn"
      onClick={toggleTheme}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? (
            <MoonIcon className="theme-icon moon-icon" />
          ) : (
            <SunIcon className="theme-icon sun-icon" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle; 