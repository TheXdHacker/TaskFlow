import { create } from 'zustand';
import api from '../utils/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // Fetch all projects accessible to the logged-in user
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data.data, loading: false });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to load projects.';
      set({ error: errMsg, loading: false });
    }
  },

  // Set or fetch details for a single selected project
  fetchProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      // Look up project list first to save request if already loaded
      const found = get().projects.find(p => p._id === id);
      if (found) {
        set({ currentProject: found, loading: false });
      } else {
        // Fallback: fetch from API. Since GET /api/projects returns user's projects, we can filter locally.
        const response = await api.get('/projects');
        const proj = response.data.data.find(p => p._id === id);
        if (proj) {
          set({ currentProject: proj, projects: response.data.data, loading: false });
        } else {
          set({ error: 'Project not found.', loading: false });
        }
      }
    } catch (error) {
      set({ error: 'Failed to retrieve project details.', loading: false });
    }
  },

  // Create a new project (Admin Only)
  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/projects', projectData);
      const newProject = response.data.data;
      
      // Update state with new project added to list
      set(state => ({
        projects: [newProject, ...state.projects],
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to create project.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update project details/members (Admin Only)
  updateProject: async (id, projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      const updatedProject = response.data.data;
      
      set(state => ({
        projects: state.projects.map(p => p._id === id ? updatedProject : p),
        currentProject: state.currentProject?._id === id ? updatedProject : state.currentProject,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update project.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Delete a project (Admin Only)
  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      
      set(state => ({
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete project.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Clear active selected project
  clearCurrentProject: () => set({ currentProject: null }),
}));
