import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

interface StreakDisplayProps {
  streak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <div className="streak-display">
      <div className="streak-content">
        <FireIcon className="streak-fire-icon" />
        <span className="streak-number">{streak}</span>
        <span className="streak-text">days</span>
      </div>
    </div>
  );
};

export default StreakDisplay; 