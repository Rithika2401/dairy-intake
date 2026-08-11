import axios from 'axios';

const getNormalizedBaseUrl = (configuredUrl) => {
  let url = (configuredUrl || '').trim();

  // Automatic production auto-switch: if running in browser on a non-localhost host (e.g. Vercel), override localhost defaults
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      url = 'https://dairy-intake-1.onrender.com/api/v1';
    }
  }

  if (!url) {
    url = 'https://dairy-intake-1.onrender.com/api/v1';
  }

  let cleanUrl = url.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api/v1')) {
    cleanUrl = `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

const API_BASE_URL = getNormalizedBaseUrl(import.meta.env.VITE_API_BASE_URL);

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
        const savedUser = localStorage.getItem('dairy_hub_user');
        if (!savedUser && window.location.pathname !== '/login') {
          localStorage.removeItem('dairy_hub_token');
          localStorage.removeItem('dairy_hub_user');
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
