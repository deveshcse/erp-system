import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar aria-label="Sidebar Desktop" />
      </div>

      {/* Sidebar - mobile */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar}></div>
        <div 
          className={`relative w-64 h-full bg-card transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar onMobileClose={toggleSidebar} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
