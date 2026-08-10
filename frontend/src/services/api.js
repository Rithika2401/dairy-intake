import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Token & Idempotency Key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dairy_hub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete'].includes(config.method)) {
      config.headers['X-Idempotency-Key'] = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401, 403, 429 Error Redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('dairy_hub_token');
        localStorage.removeItem('dairy_hub_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
      } else if (status === 403 && window.location.pathname !== '/403') {
        console.warn('[API 403 Forbidden]: Access denied.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
