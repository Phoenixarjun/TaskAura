import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const quotes = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "It always seems impossible until it's done.",
  "Small deeds done are better than great deeds planned.",
  "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
  "You don't have to be great to start, but you have to start to be great.",
  "Discipline is the bridge between goals and accomplishment.",
  "Every day is a chance to get better."
];

const MotivationalQuote: React.FC = () => {
  const quote = React.useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  const { isDark } = useTheme();

  return (
    <div 
      className="dashboard-quote"
      style={{ 
        color: isDark ? '#ffffff' : '#334155',
        textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
      }}
    >
      "{quote}"
    </div>
  );
};

export default MotivationalQuote; 