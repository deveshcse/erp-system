import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Users,
  CalendarCheck,
  Wallet,
  CheckSquare,
  UserPlus,
  FileText,
  ReceiptText,
  X,
} from "lucide-react";

const Sidebar = ({ onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const roleMenus = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { name: "Companies", path: "/companies", icon: Building2 },
      { name: "Reports", path: "/reports", icon: BarChart3 },
    ],

    COMPANY_ADMIN: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { name: "Employees", path: "/employees", icon: Users },
      { name: "Attendance", path: "/attendance", icon: CalendarCheck },
      { name: "Payroll", path: "/payroll", icon: Wallet },
      { name: "Tasks", path: "/tasks", icon: CheckSquare },
      { name: "Leads", path: "/leads", icon: UserPlus },
      { name: "Quotations", path: "/quotations", icon: FileText },
      { name: "Invoices", path: "/invoices", icon: ReceiptText },
    ],

    EMPLOYEE: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
      { name: "My Tasks", path: "/tasks", icon: CheckSquare },
      { name: "My Attendance", path: "/attendance", icon: CalendarCheck },
      { name: "Payslips", path: "/payroll/payslips", icon: Wallet },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  return (
    <aside className="w-64 bg-white border-r h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6  border-b h-16">
        <h2 className="text-lg font-semibold tracking-tight ">
          ERP <span className="text-indigo-600">System</span>
        </h2>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2 p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`
                flex items-center gap-3 h-11 px-4 py-2 rounded-md text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }
              `}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-400"}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t px-5 py-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
            {user?.name?.[0]}
          </div>

          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name}
            </p>

            <p className="text-xs text-gray-500 uppercase">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;