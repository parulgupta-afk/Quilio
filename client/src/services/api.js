import axios from 'axios';

export function getApiBaseUrl() {
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl && rawApiUrl.trim()) {
    const trimmed = rawApiUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  const isDev =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname));
  if (isDev) {
    return '/api'; // Use Vite dev proxy
  }

  return 'https://quilio.onrender.com/api';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if available
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('quilio-auth');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
