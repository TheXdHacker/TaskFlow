import axios from 'axios';

// Create an Axios instance with pre-configured settings
const api = axios.create({
  // Fallback to local server port 5000 if VITE_API_URL environment variable is not defined
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT token into the headers of outgoing requests
api.interceptors.request.use(
  (config) => {
    // Fetch token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Attach bearer token authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);

// Response Interceptor: Globally handle error responses (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, token is invalid/expired -> log user out
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected, clearing local token...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optionally redirect to login or let Zustand store sync trigger it
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
