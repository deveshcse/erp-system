import { formatDate } from "../../utils/formatters";
import { ClipboardList } from "lucide-react";

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
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <ClipboardList size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No tasks found</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "text-purple-600";
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Task</th>
            <th>
              Assigned {isAdmin ? "To" : "By"}
            </th>
            <th>Deadline</th>
            <th>Priority</th>
            <th>Status</th>
            {!isAdmin && (
              <th className="text-right">Actions</th>
            )}
          </tr>
        </thead>

        <tbody className="">
          {tasks.map((task) => {
            const assignedUser = isAdmin
              ? task.assignedTo?.fullName
              : task.assignedBy?.name;

            const isOverdue =
              new Date(task.deadline) < new Date() &&
              task.status !== "COMPLETED";

            return (
              <tr
                key={task._id}
                className="hover:bg-gray-50 transition"
              >
                {/* Task */}
                <td className="px-6 py-4 max-w-xs">
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={task.title}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                    {task.description}
                  </p>
                </td>

                {/* Assigned */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                      {assignedUser?.[0] || "U"}
                    </div>
                    <span className="text-sm text-gray-700">
                      {assignedUser}
                    </span>
                  </div>
                </td>

                {/* Deadline */}
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-800">
                    {formatDate(task.deadline)}
                  </p>

                  {isOverdue && (
                    <span className="text-xs text-red-500">
                      Overdue
                    </span>
                  )}
                </td>

                {/* Priority */}
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-medium ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  ) : (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onStatusUpdate(task._id, e.target.value)
                      }
                      className="text-sm border rounded-md px-2 py-1 focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">
                        In Progress
                      </option>
                      <option value="COMPLETED">
                        Completed
                      </option>
                    </select>
                  )}
                </td>

                {!isAdmin && (
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    —
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;