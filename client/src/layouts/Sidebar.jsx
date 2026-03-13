import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'] },
    { name: 'Employees', path: '/employees', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { name: 'Attendance', path: '/attendance', roles: ['COMPANY_ADMIN', 'EMPLOYEE'] },
    { name: 'Payroll', path: '/payroll', roles: ['COMPANY_ADMIN'] },
    { name: 'Tasks', path: '/tasks', roles: ['COMPANY_ADMIN', 'EMPLOYEE'] },
    { name: 'Leads', path: '/leads', roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    { name: 'Quotations', path: '/quotations', roles: ['COMPANY_ADMIN'] },
    { name: 'Invoices', path: '/invoices', roles: ['COMPANY_ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-card border-r h-screen sticky top-0 transition-all duration-300">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">ERP System</h2>
      </div>
      <nav className="mt-6 px-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
