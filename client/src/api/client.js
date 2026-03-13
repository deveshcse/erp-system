import axios from 'axios';
import { tokenManager } from './tokenManager';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  // Required so the browser sends the httpOnly refresh-token cookie
  withCredentials: true,
});

// ── Request interceptor ── Attach access token from memory
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ── Silent access-token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and NOT already a retry, attempt silent refresh
    // Ensure we don't refresh for the refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 && 
      !original._retry && 
      !original.url.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // The refresh-token cookie is sent automatically (withCredentials: true)
        const { data } = await apiClient.post('/auth/refresh-token');
        const newToken = data.data.accessToken;
        tokenManager.set(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clear();
        // Let the app handle redirect via ProtectedRoute
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
