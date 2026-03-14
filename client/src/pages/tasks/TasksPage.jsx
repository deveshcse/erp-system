import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks.api';
import { useAuth } from '../../context/AuthContext';
import TaskTable from '../../components/tasks/TaskTable';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';

const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  const [activeFilter, setActiveFilter] = useState('All'); // All, PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', user?._id, activeFilter],
    queryFn: () => tasksApi.getAll({ 
      status: activeFilter === 'All' ? undefined : activeFilter 
    }),
    enabled: !!user?._id,
  });

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: (data) => tasksApi.create({ ...data, assignedBy: user?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setIsModalOpen(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  });

  const tasksResult = tasksData?.data?.data;
  const tasks = Array.isArray(tasksResult) ? tasksResult : (tasksResult?.tasks || []);

  // Summary Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Task Management</h1>
          <p className="text-sm text-gray-500 mt-1">Assign, track, and manage team responsibilities</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'gray' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'In Progress', value: stats.inProgress, color: 'blue' },
          { label: 'Completed', value: stats.completed, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-gray-50 rounded-lg w-full sm:w-max border border-gray-100 shadow-sm overflow-x-auto">
        {[
          { label: 'All', value: 'All' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 whitespace-nowrap ${
              activeFilter === filter.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label} {filter.value === 'All' ? '' : `(${stats[filter.label.toLowerCase().replace(' ', '')] || 0})`}
          </button>
        ))}
      </div>

      <TaskTable 
        tasks={tasks} 
        isAdmin={isAdmin} 
        isLoading={isLoading} 
        onStatusUpdate={(id, status) => updateStatusMutation.mutate({ id, status })}
      />

      {isModalOpen && (
        <CreateTaskModal
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setIsModalOpen(false)}
          isSaving={createMutation.isLoading}
        />
      )}
    </div>
  );
};

export default TasksPage;
