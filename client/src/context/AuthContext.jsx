import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { tokenManager } from '../api/tokenManager';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On every page load: try to get a new access token using the stored
   * refresh token. If none exists or the refresh fails, the user must log in.
   */
  useEffect(() => {
    const rehydrate = async () => {
      const storedRefresh = tokenManager.getRefresh();

      if (!storedRefresh) {
        // No refresh token — definitely not logged in
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await authApi.refresh(storedRefresh);
        const { user: freshUser, accessToken, refreshToken } = data.data;
        tokenManager.set(accessToken);
        tokenManager.setRefresh(refreshToken);
        setUser(freshUser);
      } catch {
        // Refresh token expired or invalid — clear everything
        tokenManager.clearAll();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []);

  /** Called after successful login with the values from the API response */
  const login = useCallback((userData, accessToken, refreshToken) => {
    tokenManager.set(accessToken);
    tokenManager.setRefresh(refreshToken);
    setUser(userData);
  }, []);

  /** Calls /auth/logout on the server then wipes all local token state */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenManager.clearAll();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (roles) => !!user && roles.includes(user.role),
    [user]
  );

  const isAuthenticated = !!user && !!tokenManager.get();

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
