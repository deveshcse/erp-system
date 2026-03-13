import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Layout for public pages (Login, Forgot Password).
 * If user is already authenticated, redirect to the dashboard.
 */
const AuthLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
