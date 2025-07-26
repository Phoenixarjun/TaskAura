import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      style={{
        backgroundColor: colors.tertiaryBg,
        border: `1px solid ${colors.primaryBorder}`,
      }}
    >
      <div 
        className="theme-toggle-track"
        style={{
          backgroundColor: colors.secondaryBg,
        }}
      >
        <div 
          className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}
          style={{
            backgroundColor: colors.accentText,
            color: '#fff',
          }}
        >
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