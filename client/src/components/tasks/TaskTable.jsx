import { formatDate } from '../../utils/formatters';

const TaskTable = ({ tasks, onStatusUpdate, isAdmin, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="font-medium">No tasks found</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-purple-600 font-bold';
      case 'HIGH': return 'text-red-600 font-bold';
      case 'MEDIUM': return 'text-yellow-600 font-bold';
      case 'LOW': return 'text-green-600 font-bold';
      default: return 'text-gray-600 font-bold';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Details</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned {isAdmin ? 'To' : 'By'}</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
            {!isAdmin && <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tasks.map((task) => (
            <tr key={task._id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4 max-w-xs">
                <p className="text-sm font-bold text-gray-900 truncate" title={task.title}>{task.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">
                    {(isAdmin ? task.assignedTo?.fullName : task.assignedBy?.name)?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {isAdmin ? task.assignedTo?.fullName : task.assignedBy?.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs font-bold text-gray-900">{formatDate(task.deadline)}</p>
                {new Date(task.deadline) < new Date() && task.status !== 'Completed' && (
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Overdue</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] uppercase tracking-widest ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                {isAdmin ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                ) : (
                  <select
                    value={task.status}
                    onChange={(e) => onStatusUpdate(task._id, e.target.value)}
                    className={`text-[10px] font-bold border rounded-full px-2 py-0.5 outline-none focus:ring-1 focus:ring-gray-900 ${getStatusStyle(task.status)} cursor-pointer`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                )}
              </td>
              {!isAdmin && (
                <td className="px-6 py-4 text-right">
                   {/* Inline actions for non-admin if any, or just status dropdown is enough */}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
