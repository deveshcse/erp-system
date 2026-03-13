import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/auth/Login';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmployeesPage from '../pages/employees/EmployeesPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import PayrollPage from '../pages/payroll/PayrollPage';
import TasksPage from '../pages/tasks/TasksPage';
import LeadsPage from '../pages/leads/LeadsPage';
import QuotationsPage from '../pages/quotations/QuotationsPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import CompaniesPage from '../pages/companies/CompaniesPage';
import ReportsPage from '../pages/reports/ReportsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes — wrapped in AuthLayout to redirect authenticated users */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Standalone public pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard Layout Wrapper */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Super Admin Specific */}
          <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Company Admin & Super Admin (Shared) */}
          <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN']} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/leads" element={<LeadsPage />} />
          </Route>

          {/* Company Admin Specific */}
          <Route element={<RoleProtectedRoute allowedRoles={['COMPANY_ADMIN']} />}>
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Route>

          {/* Shared Employee/Admin */}
          <Route element={<RoleProtectedRoute allowedRoles={['COMPANY_ADMIN', 'EMPLOYEE']} />}>
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>

          {/* Employee Specific */}
          <Route element={<RoleProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/payroll/payslips" element={<PayrollPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
