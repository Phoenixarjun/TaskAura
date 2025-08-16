import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/apiService';
import toast from 'react-hot-toast';

// User interface
interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Optimistically hydrate user from localStorage to survive refreshes
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as User;
            setUser(parsed);
          } catch {}
        }

        const token = localStorage.getItem('token');
        if (token) {
          // Try to get user profile
          const userData = await authAPI.getProfile() as { user: User };
          setUser(userData.user);
          // Ensure userId is stored for convenience
          localStorage.setItem('userId', userData.user.userId);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only clear storage on explicit auth errors; keep session for transient errors
        const message = (error as any)?.message ? String((error as any).message) : '';
        if (message.toLowerCase().includes('authentication required')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password }) as { token: string; user: User };
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userId', response.user.userId);
      
      setUser(response.user);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      const status = error.status;
      
      // Provide specific error messages based on status and content
      if (status === 400) {
        if (errorMessage.includes('Missing required fields')) {
          toast.error('Please fill in all required fields.');
        } else {
          toast.error(errorMessage);
        }
      } else if (status === 401) {
        if (errorMessage.includes('Invalid credentials') || errorMessage.includes('incorrect')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else {
          toast.error('Authentication failed. Please check your credentials.');
        }
      } else if (status === 404) {
        toast.error('User not found. Please check your email or register for a new account.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ name, email, password }) as { token: string; user: User };
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userId', response.user.userId);
      
      setUser(response.user);
      toast.success('Registration successful! Welcome to TaskAura!');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      const status = error.status;
      
      // Provide specific error messages based on status and content
      if (status === 400) {
        if (errorMessage.includes('already exists') || errorMessage.includes('User already exists')) {
          toast.error('An account with this email already exists. Please login instead or use a different email.');
        } else if (errorMessage.includes('Missing required fields')) {
          toast.error('Please fill in all required fields (name, email, and password).');
        } else if (errorMessage.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (errorMessage.includes('Password')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(errorMessage);
        }
      } else if (status === 409) {
        toast.error('An account with this email already exists. Please login instead.');
      } else if (status === 422) {
        toast.error('Invalid input data. Please check your information and try again.');
      } else if (status === 500) {
        toast.error('Server error during registration. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update profile function
  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(data) as { user: User };
      
      // Update user data
      const updatedUser = { ...user, ...response.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (response.user?.userId) {
        localStorage.setItem('userId', response.user.userId);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      const status = error.status;
      
      if (status === 400) {
        if (errorMessage.includes('already exists')) {
          toast.error('This email is already taken. Please use a different email.');
        } else if (errorMessage.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(errorMessage);
        }
      } else if (status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.message || 'Failed to change password. Please try again.';
      const status = error.status;
      
      if (status === 400) {
        if (errorMessage.includes('Missing required fields')) {
          toast.error('Please provide both current and new password.');
        } else {
          toast.error(errorMessage);
        }
      } else if (status === 401) {
        if (errorMessage.includes('Invalid current password') || errorMessage.includes('incorrect')) {
          toast.error('Current password is incorrect. Please try again.');
        } else {
          toast.error('Authentication required. Please login again.');
        }
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 