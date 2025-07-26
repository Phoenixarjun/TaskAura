import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ThemeColors {
  // Background colors
  primaryBg: string;
  secondaryBg: string;
  tertiaryBg: string;
  cardBg: string;
  modalBg: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  accentText: string;
  
  // Border colors
  primaryBorder: string;
  secondaryBorder: string;
  accentBorder: string;
  
  // Interactive colors
  primaryButton: string;
  secondaryButton: string;
  hoverBg: string;
  focusRing: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gradient colors
  primaryGradient: string;
  secondaryGradient: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  // Background colors
  primaryBg: '#f8fafc',
  secondaryBg: '#ffffff',
  tertiaryBg: '#f1f5f9',
  cardBg: '#ffffff',
  modalBg: '#ffffff',
  
  // Text colors
  primaryText: '#1e293b',
  secondaryText: '#475569',
  tertiaryText: '#64748b',
  accentText: '#3b82f6',
  
  // Border colors
  primaryBorder: '#e2e8f0',
  secondaryBorder: '#cbd5e1',
  accentBorder: '#3b82f6',
  
  // Interactive colors
  primaryButton: '#3b82f6',
  secondaryButton: '#f1f5f9',
  hoverBg: '#f8fafc',
  focusRing: '#3b82f6',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Gradient colors
  primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondaryGradient: 'linear-gradient(90deg, #10b981, #6366f1)',
};

const darkColors: ThemeColors = {
  // Background colors
  primaryBg: '#0f172a',
  secondaryBg: '#1e293b',
  tertiaryBg: '#334155',
  cardBg: '#1e293b',
  modalBg: '#1e293b',
  
  // Text colors
  primaryText: '#f8fafc',
  secondaryText: '#e2e8f0',
  tertiaryText: '#cbd5e1',
  accentText: '#60a5fa',
  
  // Border colors
  primaryBorder: '#334155',
  secondaryBorder: '#475569',
  accentBorder: '#60a5fa',
  
  // Interactive colors
  primaryButton: '#60a5fa',
  secondaryButton: '#334155',
  hoverBg: '#334155',
  focusRing: '#60a5fa',
  
  // Status colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Gradient colors
  primaryGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  secondaryGradient: 'linear-gradient(90deg, #34d399, #818cf8)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Apply CSS custom properties for colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, [isDark, colors]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}; 