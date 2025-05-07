import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Standard axios instance for non-authenticated requests
export const axiosInstance = axios.create({
  baseURL,
});

// Authenticated axios instance for requests that require authentication
export const authAxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to request headers
authAxiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from session storage or another source
    const session = await fetch('/api/auth/session').then((res) => res.json());
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
authAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call token refresh endpoint
        await fetch('/api/auth/refresh').then((res) => {
          if (!res.ok) throw new Error('Failed to refresh token');
          return res.json();
        });
        
        // Retry the original request
        return authAxiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;