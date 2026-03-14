import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';
import { tasksApi } from '../../api/tasks.api';
import { leadsApi } from '../../api/leads.api';

const Dashboard = () => {
  // Fetch only total counts by limiting pagination response to 1
  const { data: employeesData } = useQuery({
    queryKey: ['dashboard-employees'],
    queryFn: () => employeesApi.getAll({ limit: 1 }),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => tasksApi.getAll({ limit: 1, status: 'PENDING' }),
  });

  const { data: leadsData } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: () => leadsApi.getAll({ limit: 1 }),
  });

  // Extract totals safely
  const totalEmployees = employeesData?.data?.data?.pagination?.total || 0;
  const pendingTasks = tasksData?.data?.data?.pagination?.total || 0;
  const totalLeads = leadsData?.data?.data?.pagination?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dashboard Overview</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Employees</h4>
          <p className="text-4xl font-black text-gray-900">{totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tasks Pending</h4>
          <p className="text-4xl font-black text-blue-600">{pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Leads</h4>
          <p className="text-4xl font-black text-purple-600">{totalLeads}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
