// API Configuration
const getApiBaseUrl = () => {
  // In development, use local server or VITE_API_URL
  if (!import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }
  
  // In production, always use the main domain
  // This ensures all deployments use the same API endpoint
  return 'https://taskaura.vercel.app';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  weeklyTasks: `${API_BASE_URL}/api/weekly-tasks`,
  learnTasks: `${API_BASE_URL}/api/learn-tasks`,
  dailyTasks: `${API_BASE_URL}/api/daily-tasks`,
  health: `${API_BASE_URL}/health`,
}; 