import React from 'react';

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

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div style={{
      marginBottom: '1rem',
      textAlign: 'center',
      fontSize: '1.125rem',
      fontStyle: 'italic',
      color: isDark ? '#e2e8f0' : '#1e293b',
      transition: 'color 0.3s ease',
      lineHeight: '1.6'
    }}>
      "{quote}"
    </div>
  );
};

export default MotivationalQuote; 