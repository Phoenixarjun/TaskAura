// API service for TaskAura backend

const API_BASE_URL = 'http://localhost:4000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token;
};

// Helper function to get auth headers
const getAuthHeaders = (endpoint?: string): HeadersInit => {
  const token = getAuthToken();
  const isAuthEndpoint = endpoint?.startsWith('/auth/');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token && !isAuthEndpoint) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: getAuthHeaders(endpoint),
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      
      // Try to get the error message from the response
      try {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (userData: { name?: string; email?: string }) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Daily Tasks API
export const dailyTasksAPI = {
  getAll: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`/daily-tasks${params}`);
  },

  create: async (taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    date?: string;
  }) => {
    return apiRequest('/daily-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: any) => {
    return apiRequest(`/daily-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/daily-tasks/${id}`, {
      method: 'DELETE',
    });
  },

  toggle: async (id: string) => {
    return apiRequest(`/daily-tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  getStats: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`/daily-tasks/stats${params}`);
  },
};

// Weekly Tasks API
export const weeklyTasksAPI = {
  getAll: async (weekStart?: string) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return apiRequest(`/weekly-tasks${params}`);
  },

  create: async (taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
  }) => {
    return apiRequest('/weekly-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: any) => {
    return apiRequest(`/weekly-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/weekly-tasks/${id}`, {
      method: 'DELETE',
    });
  },

  toggle: async (id: string) => {
    return apiRequest(`/weekly-tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  getStats: async (weekStart?: string) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return apiRequest(`/weekly-tasks/stats${params}`);
  },
};

// Learn Tasks API
export const learnTasksAPI = {
  getAll: async () => {
    return apiRequest('/learn-tasks');
  },

  create: async (taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    duration: number;
    subject: string;
  }) => {
    return apiRequest('/learn-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: any) => {
    return apiRequest(`/learn-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/learn-tasks/${id}`, {
      method: 'DELETE',
    });
  },

  toggle: async (id: string) => {
    return apiRequest(`/learn-tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  getStats: async () => {
    return apiRequest('/learn-tasks/stats');
  },

  getBySubject: async (subject?: string) => {
    const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return apiRequest(`/learn-tasks/by-subject${params}`);
  },
};

// Demo API (for testing without authentication)
export const demoAPI = {
  getDailyTasks: async () => {
    return apiRequest('/demo/daily-tasks');
  },

  getWeeklyTasks: async () => {
    return apiRequest('/demo/weekly-tasks');
  },

  getLearnTasks: async () => {
    return apiRequest('/demo/learn-tasks');
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    // Health endpoint is at root level, not under /api
    const response = await fetch('http://localhost:4000/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default {
  auth: authAPI,
  dailyTasks: dailyTasksAPI,
  weeklyTasks: weeklyTasksAPI,
  learnTasks: learnTasksAPI,
  demo: demoAPI,
  health: healthAPI,
}; 