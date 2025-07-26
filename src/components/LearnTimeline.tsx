import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

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
  Tech: 'category-tech',
  Life: 'category-life',
  Finance: 'category-finance',
  Mindset: 'category-mindset',
  Other: 'category-other',
};

const LearnTimeline: React.FC<LearnTimelineProps> = ({ learnings }) => {
  const { colors } = useTheme();
  
  return (
    <div className="learn-timeline">
      {learnings.map((item, idx) => (
        <div 
          key={idx} 
          className="learn-timeline-item"
          style={{
            backgroundColor: colors.cardBg,
          }}
        >
          <div className="learn-timeline-header">
            <span className={`category-badge ${categoryColors[item.category] || 'category-other'}`}>
              {item.category}
            </span>
            <span 
              className="learn-timeline-title"
              style={{ color: colors.primaryText }}
            >
              {item.title}
            </span>
          </div>
          {item.source && (
            <a 
              href={item.source} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="learn-timeline-source"
              style={{ color: colors.accentText }}
            >
              Source
            </a>
          )}
          <span 
            className="learn-timeline-date"
            style={{ color: colors.tertiaryText }}
          >
            {item.date}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LearnTimeline; 