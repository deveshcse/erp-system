import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut } from "lucide-react";

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-4 h-4 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={20} className="md:hidden" />
        </button>

        <span className="hidden sm:inline-flex items-center text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-md">
          {user?.role?.replace("_", " ")}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0] || "U"}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 h-9 p-4 rounded-lg border text-sm font-medium  text-red-600 bg-red-50 hover:rounded-md hover:bg-red-200 transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;