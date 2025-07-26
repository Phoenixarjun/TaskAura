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
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { 
                legend: { 
                  display: false,
                  labels: {
                    color: colors.primaryText
                  }
                },
                tooltip: {
                  backgroundColor: colors.modalBg,
                  titleColor: colors.primaryText,
                  bodyColor: colors.primaryText,
                  borderColor: colors.accentBorder,
                  borderWidth: 1
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: colors.secondaryText
                  },
                  grid: {
                    color: colors.primaryBorder
                  }
                },
                x: {
                  ticks: {
                    color: colors.secondaryText
                  },
                  grid: {
                    color: colors.primaryBorder
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
                    color: colors.primaryText
                  }
                },
                tooltip: {
                  backgroundColor: colors.modalBg,
                  titleColor: colors.primaryText,
                  bodyColor: colors.primaryText,
                  borderColor: colors.accentBorder,
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