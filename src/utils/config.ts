// API Configuration
const getApiBaseUrl = () => {
  // In development, use local server or VITE_API_URL
  if (!import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }
  
  // In production, ALWAYS use the main domain regardless of environment variables
  // This prevents deployment-specific URLs from being used
  const PRODUCTION_API_URL = 'https://taskaura.vercel.app';
  
  console.log('Production API URL:', PRODUCTION_API_URL);
  console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Using API URL:', PRODUCTION_API_URL);
  
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  weeklyTasks: `${API_BASE_URL}/api/weekly-tasks`,
  learnTasks: `${API_BASE_URL}/api/learn-tasks`,
  dailyTasks: `${API_BASE_URL}/api/daily-tasks`,
  health: `${API_BASE_URL}/health`,
}; 