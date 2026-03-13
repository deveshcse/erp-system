import apiClient from './client';

export const authApi = {
  /** Login — server sets httpOnly refresh-token cookie; response contains access token */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /** Exchange a refresh token for a new access token (sent via cookie) */
  refresh: () => apiClient.post('/auth/refresh-token'),

  /** Register a new user (SUPER_ADMIN only) */
  register: (data) => apiClient.post('/auth/register', data),

  /** Get the currently logged-in user's profile (requires valid access token) */
  getProfile: () => apiClient.get('/auth/profile'),

  /** Logout — server clears the httpOnly cookie */
  logout: () => apiClient.post('/auth/logout'),

  /** Change the current user's password */
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};
