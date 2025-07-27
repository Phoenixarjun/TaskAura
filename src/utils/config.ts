// Configuration for API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  weeklyTasks: `${API_BASE_URL}/api/weekly-tasks`,
  learnHistory: `${API_BASE_URL}/api/learn-history`,
  dailyTasks: `${API_BASE_URL}/api/daily-tasks`,
  health: `${API_BASE_URL}/api/health`,
}; 