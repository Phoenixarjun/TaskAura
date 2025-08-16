// API service for TaskAura backend

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:4000/api');

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

// Sleep helper
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Generic API request function with simple 429 retry
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
    let attempt = 0;
    let response: Response | null = null;
    while (attempt < 3) {
      response = await fetch(url, config);
      if (response.status !== 429) break;
      const backoff = Math.min(2000 * Math.pow(2, attempt), 8000);
      await sleep(backoff);
      attempt++;
    }
    if (!response) throw new Error('Network error');
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        throw new Error('Authentication required');
      }
      if (response.status === 429) {
        // Too many requests: use server message or a friendly fallback
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error;
          if (errorMessage) throw new Error(errorMessage);
        } catch (_) {
          const retryAfter = response.headers.get('Retry-After');
          const hint = retryAfter ? ` Please retry after ${retryAfter} seconds.` : '';
          throw new Error(`Too many requests. Please wait a moment and try again.${hint}`);
        }
      }
      
      // Try to get the error message from the response
      try {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        
        // Create a more detailed error object
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      } catch (parseError) {
        // If we can't parse the response, create a generic error
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
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
    // Debounced health check
    const healthUrl = import.meta.env.PROD 
      ? '/health' 
      : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/health` : 'http://localhost:4000/health');
    const response = await fetch(healthUrl, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const hint = retryAfter ? ` Please retry after ${retryAfter} seconds.` : '';
        throw new Error(`Too many requests. Please wait a moment and try again.${hint}`);
      }
      throw new Error(`Request failed (${response.status}). Please try again.`);
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