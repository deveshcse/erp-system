import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Shared Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
  </div>
);

// Lazy-loaded Pages
const Login = lazy(() => import('../pages/auth/Login'));
const UnauthorizedPage = lazy(() => import('../pages/auth/UnauthorizedPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const EmployeesPage = lazy(() => import('../pages/employees/EmployeeList'));
const AttendancePage = lazy(() => import('../pages/attendance/AttendancePage'));
const PayrollPage = lazy(() => import('../pages/payroll/PayrollPage'));
const TasksPage = lazy(() => import('../pages/tasks/TasksPage'));
const LeadsPage = lazy(() => import('../pages/leads/LeadsPage'));
const QuotationsPage = lazy(() => import('../pages/quotations/QuotationsPage'));
const InvoicesPage = lazy(() => import('../pages/invoices/InvoicesPage'));
const CompaniesPage = lazy(() => import('../pages/companies/CompaniesPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
  );
};

export default AppRoutes;
