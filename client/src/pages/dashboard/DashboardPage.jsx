import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { employeesApi } from '../../api/employees.api';
import { tasksApi } from '../../api/tasks.api';
import { leadsApi } from '../../api/leads.api';
import { companiesApi } from '../../api/companies.api';
import { attendanceApi } from '../../api/attendance.api';
import { dashboardApi } from '../../api/dashboard.api';
import { formatDate } from '../../utils/formatters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

// Constants for Charts
const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Helper for Stats Cards
const StatCard = ({ title, value, colorClass = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
      {title}
    </h4>
    <p className={`text-4xl font-black ${colorClass}`}>{value}</p>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
      <span className="w-2 h-2 bg-gray-900 rounded-full"></span>
      {title}
    </h3>
    <div className="w-full h-100">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-charts-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const stats = dashboardStats?.data?.data || {};

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
    queryFn: () => tasksApi.getAll({ limit: 5 }), 
    enabled: role === 'EMPLOYEE',
  });

  const { data: myAttendanceData } = useQuery({
    queryKey: ['dashboard-my-attendance'],
    queryFn: () => attendanceApi.getAll({ limit: 5 }),
    enabled: role === 'EMPLOYEE',
  });

  if (isLoadingStats) {
      return (
        <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      );
  }

  // --- Render Super Admin Dashboard ---
  if (role === 'SUPER_ADMIN') {
    const totalCompanies = companyStats?.data?.data?.totalCompanies || 0;
    const recentCompanies = companyStats?.data?.data?.recentCompanies || [];
    
    const chartData = stats.registrationTrend?.map(item => ({
      name: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      registrations: item.count
    })) || [];

    return (
      <div className="space-y-6 pb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Console</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Total Enterprise Clients" value={totalCompanies} colorClass="text-gray-900" />
          <StatCard title="System Uptime" value="99.9%" colorClass="text-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer title="Company Growth Trend">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#111827' }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Registrations</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {recentCompanies.map(c => (
                <div key={c._id} className="px-6 py-4 hover:bg-gray-50/50 transition flex justify-between items-center border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{c.companyName}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{c.companyEmail}</p>
                  </div>
                  <span className="text-[10px] font-black text-gray-300">{formatDate(c.createdAt)}</span>
                </div>
              ))}
            </div>
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

    const leadChartData = stats.leadStats?.map(item => ({
      name: item._id,
      value: item.count
    })) || [];

    const revenueChartData = stats.revenueTrend?.map(item => ({
      name: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      revenue: item.revenue
    })) || [];

    return (
      <div className="space-y-6 pb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Organization Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Workforce" value={totalEmployees} />
          <StatCard title="Active Leads" value={totalLeads} colorClass="text-blue-600" />
          <StatCard title="Critical Tasks" value={pendingTasks} colorClass="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Revenue Growth (₹)">
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="revenue" fill="#0F172A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>

          <ChartContainer title="Lead Pipeline Distribution">
            <PieChart>
              <Pie
                data={leadChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {leadChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    );
  }

  // --- Render Employee Dashboard ---
  if (role === 'EMPLOYEE') {
    const tasks = myTasksData?.data?.data?.tasks || [];
    const attendance = myAttendanceData?.data?.data?.history || [];

    const taskChartData = stats.taskStats?.map(item => ({
      name: item._id,
      value: item.count
    })) || [];

    return (
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Workspace</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ready for today, {user.name.split(' ')[0]}?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
             <ChartContainer title="Task Completion">
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                </PieChart>
             </ChartContainer>
           </div>

           <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Priority Assignments</h3>
              </div>
              <div className="flex-1 overflow-y-auto min-h-75">
                {tasks.length > 0 ? tasks.map(t => (
                  <div key={t._id} className="px-6 py-4 hover:bg-gray-50/50 transition flex justify-between items-center border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Due {formatDate(t.deadline)}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          t.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>{t.priority}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      t.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                     <p className="text-sm font-medium italic">No pending assignments</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest text-center">Recent Attendance Log</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 divide-x divide-gray-50">
              {attendance.map(a => (
                <div key={a._id} className="p-6 text-center hover:bg-gray-50/50 transition">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{new Date(a.date).toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}</p>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    a.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
        </div>
      </div>
    );
  }

  return (role ? null : (
    <div className="h-64 flex items-center justify-center text-gray-400">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  ));
};

export default Dashboard;
