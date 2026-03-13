import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="hidden sm:inline-block text-xs font-semibold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white ring-1 ring-gray-100">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
        <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-0"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="hidden xs:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
