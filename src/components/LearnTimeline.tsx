import React from 'react';

interface Learning {
  title: string;
  category: string;
  source?: string;
  date: string;
}

interface LearnTimelineProps {
  learnings: Learning[];
}

const categoryColors: Record<string, string> = {
  Tech: 'bg-blue-500',
  Life: 'bg-green-500',
  Finance: 'bg-yellow-500',
  Mindset: 'bg-purple-500',
  Other: 'bg-gray-500',
};

const LearnTimeline: React.FC<LearnTimelineProps> = ({ learnings }) => {
  return (
    <div className="flex flex-col gap-4">
      {learnings.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-dark-bg rounded-lg shadow p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs text-white ${categoryColors[item.category] || 'bg-gray-500'}`}>{item.category}</span>
            <span className="font-semibold text-light-text dark:text-light-text">{item.title}</span>
          </div>
          {item.source && (
            <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm underline">Source</a>
          )}
          <span className="text-xs text-gray-400">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export default LearnTimeline; 