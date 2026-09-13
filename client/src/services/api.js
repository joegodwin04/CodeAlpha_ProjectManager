import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token + mutation safety net
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');

    // ── GUEST MODE SAFETY NET ──────────────────────────────────────────────
    // Block mutating requests (POST/PUT/PATCH/DELETE) when unauthenticated,
    // EXCEPT for public auth endpoints (login, register, password reset).
    const requestUrl = config.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/verify-security-answer') ||
      requestUrl.includes('/auth/reset-password');

    const mutatingMethods = ['post', 'put', 'patch', 'delete'];
    if (!isAuthEndpoint && !token && mutatingMethods.includes(config.method?.toLowerCase())) {
      return Promise.reject(
        Object.assign(new Error('Unauthenticated: mutation not permitted in guest mode.'), {
          isGuestModeBlock: true,
        })
      );
    }
    // ──────────────────────────────────────────────────────────────────────

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = 
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/forgot-password') ||
        requestUrl.includes('/auth/verify-security-answer') ||
        requestUrl.includes('/auth/reset-password');

      // Only perform global logout/redirect if the 401 was on a protected session request
      if (!isAuthEndpoint) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/register' && 
            window.location.pathname !== '/forgot-password' && 
            window.location.pathname !== '/reset-password') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
