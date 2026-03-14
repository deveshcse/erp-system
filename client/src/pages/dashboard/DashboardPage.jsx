import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { employeesApi } from '../../api/employees.api';
import { tasksApi } from '../../api/tasks.api';
import { leadsApi } from '../../api/leads.api';
import { companiesApi } from '../../api/companies.api';
import { attendanceApi } from '../../api/attendance.api';
import { formatDate } from '../../utils/formatters';

// Helper for Stats Cards
const StatCard = ({ title, value, colorClass = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
      {title}
    </h4>
    <p className={`text-4xl font-black ${colorClass}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  // --- Super Admin Queries ---
  const { data: companyStats } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: () => companiesApi.getStats(),
    enabled: role === 'SUPER_ADMIN',
  });

  // --- Company Admin Queries ---
  const { data: employeesData } = useQuery({
    queryKey: ['dashboard-employees'],
    queryFn: () => employeesApi.getAll({ limit: 1 }),
    enabled: role === 'COMPANY_ADMIN',
  });

  const { data: adminTasksData } = useQuery({
    queryKey: ['dashboard-admin-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 1, status: 'PENDING' }),
    enabled: role === 'COMPANY_ADMIN',
  });

  const { data: leadsData } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: () => leadsApi.getAll({ limit: 1 }),
    enabled: role === 'COMPANY_ADMIN',
  });

  // --- Employee Queries ---
  const { data: myTasksData } = useQuery({
    queryKey: ['dashboard-my-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 5 }), // Show few tasks
    enabled: role === 'EMPLOYEE',
  });

  const { data: myAttendanceData } = useQuery({
    queryKey: ['dashboard-my-attendance'],
    queryFn: () => attendanceApi.getAll({ limit: 5 }),
    enabled: role === 'EMPLOYEE',
  });

  // --- Render Super Admin Dashboard ---
  if (role === 'SUPER_ADMIN') {
    const totalCompanies = companyStats?.data?.data?.totalCompanies || 0;
    const recentCompanies = companyStats?.data?.data?.recentCompanies || [];

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Total Companies" value={totalCompanies} colorClass="text-blue-600" />
          <StatCard title="Active Systems" value={totalCompanies} colorClass="text-green-600" />
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Company Registrations</h3>
          </div>
          <div className="p-0">
            {recentCompanies.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-gray-50 text-sm">
                  {recentCompanies.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{c.companyName}</td>
                      <td className="px-6 py-4 text-gray-500">{c.companyEmail}</td>
                      <td className="px-6 py-4 text-right text-gray-400">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-gray-400 text-center italic">No companies registered yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Render Company Admin Dashboard ---
  if (role === 'COMPANY_ADMIN') {
    const totalEmployees = employeesData?.data?.data?.pagination?.total || 0;
    const pendingTasks = adminTasksData?.data?.data?.pagination?.total || 0;
    const totalLeads = leadsData?.data?.data?.pagination?.total || 0;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Employees" value={totalEmployees} />
          <StatCard title="Tasks Pending" value={pendingTasks} colorClass="text-blue-600" />
          <StatCard title="Total Leads" value={totalLeads} colorClass="text-purple-600" />
        </div>
      </div>
    );
  }

  // --- Render Employee Dashboard ---
  if (role === 'EMPLOYEE') {
    const tasks = myTasksData?.data?.data?.tasks || [];
    const attendance = myAttendanceData?.data?.data?.attendance || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Workspace</h1>
          <p className="text-sm text-gray-500">Welcome back, <span className="font-bold text-gray-900">{user.name}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">My Tasks</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {tasks.length > 0 ? tasks.map(t => (
                <div key={t._id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Deadline: {formatDate(t.deadline)}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    t.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              )) : (
                <p className="p-6 text-gray-400 text-center italic text-sm">No tasks assigned to you yet.</p>
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Recent Attendance</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {attendance.length > 0 ? attendance.map(a => (
                <div key={a._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatDate(a.date)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Source: Desktop</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    a.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              )) : (
                <p className="p-6 text-gray-400 text-center italic text-sm">No attendance records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 flex items-center justify-center text-gray-400">
      Loading your personalized dashboard...
    </div>
  );
};

export default Dashboard;
