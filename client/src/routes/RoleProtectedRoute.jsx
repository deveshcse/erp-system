import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading, hasPermission } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;

  return hasPermission(allowedRoles) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default RoleProtectedRoute;
