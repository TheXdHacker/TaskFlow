import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  // Initialize state with values stored in localStorage if they exist
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  users: [], // List of all users in the workspace (for selection dropdowns)
  loading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data.data;
      
      // Save authentication info to localStorage for persistent sessions
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please try again.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Signup action
  signup: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      const { token, ...userData } = response.data.data;
      
      // Save session info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ user: userData, token, loading: false });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed. Please check inputs.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, users: [] });
  },

  // Fetch all users in workspace (for dropdowns)
  fetchUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      set({ users: response.data.data });
    } catch (error) {
      console.error('Error fetching workspace users:', error);
    }
  },

  // Clear errors manually
  clearError: () => set({ error: null }),
}));
