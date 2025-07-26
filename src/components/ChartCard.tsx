import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartCardProps {
  title: string;
  data: any;
  type: 'bar' | 'doughnut';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, type }) => {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div style={{
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.5rem',
      boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'}`
    }}>
      {title && (
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: isDark ? '#e2e8f0' : '#1e293b',
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
            options={{ 
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
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  titleColor: isDark ? '#e2e8f0' : '#1e293b',
                  bodyColor: isDark ? '#e2e8f0' : '#1e293b',
                  borderColor: '#6366f1',
                  borderWidth: 1
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: isDark ? '#94a3b8' : '#64748b'
                  },
                  grid: {
                    color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                  }
                },
                x: {
                  ticks: {
                    color: isDark ? '#94a3b8' : '#64748b'
                  },
                  grid: {
                    color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                  }
                }
              }
            }} 
          />
        ) : (
          <Doughnut 
            data={data} 
            options={{ 
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
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  titleColor: isDark ? '#e2e8f0' : '#1e293b',
                  bodyColor: isDark ? '#e2e8f0' : '#1e293b',
                  borderColor: '#6366f1',
                  borderWidth: 1
                }
              }
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default ChartCard; 