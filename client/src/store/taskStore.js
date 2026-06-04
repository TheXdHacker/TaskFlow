import { create } from 'zustand';
import api from '../utils/api';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // Fetch tasks. Can be filtered by projectId
  fetchTasks: async (projectId = null) => {
    set({ loading: true, error: null });
    try {
      const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      const response = await api.get(url);
      set({ tasks: response.data.data, loading: false });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to retrieve tasks.';
      set({ error: errMsg, loading: false });
    }
  },

  // Create a new task (Admin Only)
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/tasks', taskData);
      const newTask = response.data.data;
      
      set(state => ({
        tasks: [...state.tasks, newTask],
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to create task.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update a task (Admins can update details, Members can only update status)
  updateTask: async (id, updates) => {
    // Optimistic UI updates could be applied, but standard update is safer
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      const updatedTask = response.data.data;
      
      set(state => ({
        tasks: state.tasks.map(t => t._id === id ? updatedTask : t),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update task.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Delete a task (Admin Only)
  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/tasks/${id}`);
      
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== id),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete task.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },
}));
