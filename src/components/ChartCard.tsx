import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../pages/Dashboard.module.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  data: any;
  type: 'bar' | 'doughnut';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, type }) => {
  const { isDark } = useTheme();
  
  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: false,
        labels: {
          color: isDark ? '#e2e8f0' : '#1e293b'
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: isDark ? '#e2e8f0' : '#fff',
        bodyColor: isDark ? '#e2e8f0' : '#fff',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : '#6366f1',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            size: 12
          }
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
        }
      },
      x: {
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            size: 12
          }
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
        }
      }
    } : undefined
  };
  
  return (
    <div className={styles.chartContainer}>
      {title && (
        <h2 className={styles.chartTitle}>{title}</h2>
      )}
      <div className={styles.chartWrapper}>
        {type === 'bar' ? (
          <Bar 
            data={data} 
            options={chartOptions} 
          />
        ) : (
          <Doughnut 
            data={data} 
            options={chartOptions} 
          />
        )}
      </div>
    </div>
  );
};

export default ChartCard; 