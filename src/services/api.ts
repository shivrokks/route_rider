import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api'
});

// Add a request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    // Get token from Clerk
    const { getToken } = useAuth();
    const token = await getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;