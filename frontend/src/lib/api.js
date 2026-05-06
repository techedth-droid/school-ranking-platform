import axios from 'axios';

const PROD_API_URL = 'https://school-ranking-platform-production.up.railway.app';
const DEFAULT_API_URL = process.env.NODE_ENV === 'production' ? PROD_API_URL : 'http://localhost:3005';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL,
  withCredentials: true,
});

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'accessToken=; path=/; max-age=0';
  document.cookie = 'refreshToken=; path=/; max-age=0';
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/accessToken=([^;]+)/);
    if (match) config.headers.Authorization = `Bearer ${match[1]}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const skipRefresh = [
        '/api/auth/login',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
      ].some((path) => url.includes(path));
      if (skipRefresh) {
        return Promise.reject(err);
      }
      try {
        if (err.config?._retry) {
          throw new Error('refresh failed');
        }
        err.config._retry = true;
        const match = document.cookie.match(/refreshToken=([^;]+)/);
        if (match && err.config) {
          const base = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
          const refreshPath = '/api/auth/refresh';
          const refreshUrl = base ? `${base}${refreshPath}` : refreshPath;
          const { data } = await axios.post(refreshUrl, {
            refreshToken: match[1],
          });
          document.cookie = `accessToken=${data.accessToken}; path=/`;
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(err.config);
        }
      } catch {
        if (typeof window !== 'undefined') {
          clearAuthCookies();
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
