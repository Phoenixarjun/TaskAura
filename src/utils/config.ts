// API Configuration
export const API_BASE_URL = import.meta.env.PROD 
  ? window.location.origin 
  : (import.meta.env.VITE_API_URL || 'http://localhost:4000');

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  weeklyTasks: `${API_BASE_URL}/api/weekly-tasks`,
  learnTasks: `${API_BASE_URL}/api/learn-tasks`,
  dailyTasks: `${API_BASE_URL}/api/daily-tasks`,
  health: `${API_BASE_URL}/health`,
}; 