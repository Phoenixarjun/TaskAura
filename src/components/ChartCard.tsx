import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  data: any;
  type: 'bar' | 'doughnut';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, type }) => {
  const { colors, isDark } = useTheme();
  
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
    <div style={{
      backgroundColor: colors.cardBg,
      borderRadius: '0.5rem',
      boxShadow: `0 4px 16px rgba(0, 0, 0, ${isDark ? '0.2' : '0.1'})`,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      border: `1px solid ${colors.primaryBorder}`
    }}>
      {title && (
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: colors.primaryText,
          transition: 'color 0.3s ease'
        }}>{title}</h2>
      )}
      <div style={{
        width: '100%',
        height: '12rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
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