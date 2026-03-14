import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ListTodo, Clock, Loader, CheckCircle2 } from "lucide-react";

import { tasksApi } from "../../api/tasks.api";
import { useAuth } from "../../context/AuthContext";

import TaskTable from "../../components/tasks/TaskTable";
import CreateTaskModal from "../../components/tasks/CreateTaskModal";

const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin =
    user?.role === "SUPER_ADMIN" || user?.role === "COMPANY_ADMIN";

  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks", user?._id, activeFilter],
    queryFn: () =>
      tasksApi.getAll({
        status: activeFilter === "All" ? undefined : activeFilter,
      }),
    enabled: !!user?._id,
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      tasksApi.create({ ...data, assignedBy: user?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      setIsModalOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  const tasksResult = tasksData?.data?.data;
  const tasks = Array.isArray(tasksResult)
    ? tasksResult
    : tasksResult?.tasks || [];

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Loader,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Task Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign, track, and manage team responsibilities
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-10 p-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition active:scale-95"
          >
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}
              >
                <Icon size={18} className={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full sm:w-max overflow-x-auto">
        {[
          { label: "All", value: "All", count: stats.total },
          { label: "Pending", value: "PENDING", count: stats.pending },
          {
            label: "In Progress",
            value: "IN_PROGRESS",
            count: stats.inProgress,
          },
          {
            label: "Completed",
            value: "COMPLETED",
            count: stats.completed,
          },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition
              ${
                activeFilter === filter.value
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {filter.label}{" "}
            <span className="text-gray-400 ml-1">
              ({filter.count})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <TaskTable
        tasks={tasks}
        isAdmin={isAdmin}
        isLoading={isLoading}
        onStatusUpdate={(id, status) =>
          updateStatusMutation.mutate({ id, status })
        }
      />

      {/* Modal */}
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