import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-outline py-1 px-3 text-xs"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
