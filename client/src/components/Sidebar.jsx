import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const roleMenus = {
    SUPER_ADMIN: [
      { name: 'Dashboard', path: '/', icon: 'dashboard' },
      { name: 'Companies', path: '/companies', icon: 'companies' },
      { name: 'Reports', path: '/reports', icon: 'reports' },
    ],
    COMPANY_ADMIN: [
      { name: 'Dashboard', path: '/', icon: 'dashboard' },
      { name: 'Employees', path: '/employees', icon: 'employees' },
      { name: 'Attendance', path: '/attendance', icon: 'attendance' },
      { name: 'Payroll', path: '/payroll', icon: 'payroll' },
      { name: 'Tasks', path: '/tasks', icon: 'tasks' },
      { name: 'Leads', path: '/leads', icon: 'leads' },
      { name: 'Quotations', path: '/quotations', icon: 'quotations' },
      { name: 'Invoices', path: '/invoices', icon: 'invoices' },
    ],
    EMPLOYEE: [
      { name: 'Dashboard', path: '/', icon: 'dashboard' },
      { name: 'My Tasks', path: '/tasks', icon: 'tasks' },
      { name: 'My Attendance', path: '/attendance', icon: 'attendance' },
      { name: 'Payslips', path: '/payroll/payslips', icon: 'payroll' },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  const icons = {
    dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    companies: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    reports: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    employees: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    attendance: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    payroll: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    tasks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    leads: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    quotations: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
    invoices: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  };

  return (
    <aside className="w-64 bg-card border-r h-full flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">ERP <span className="text-primary-500">System</span></h2>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1 rounded-md hover:bg-muted text-muted-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-gray-400'}>{icons[item.icon]}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate uppercase mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
