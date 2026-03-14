import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { employeesApi } from "../../api/employees.api";

const CreateTaskModal = ({ onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    priority: "MEDIUM",
  });

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", { limit: 1000 }],
    queryFn: () => employeesApi.getAll({ limit: 1000 }),
  });

  const employees = employeesData?.data?.data?.employees || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-full w-full overflow-auto">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Task
          </h2>

          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Task Title
            </label>

            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none"
              placeholder="Prepare quarterly report"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none"
              placeholder="Provide more context..."
            />
          </div>

          {/* Assign + Deadline */}
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Assign To
              </label>

              <select
                required
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-gray-900"
                disabled={isLoadingEmployees}
              >
                <option value="">
                  {isLoadingEmployees
                    ? "Loading employees..."
                    : "Select Employee"}
                </option>

                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName || emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Deadline
              </label>

              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-200 focus:ring-2 focus:ring-gray-900"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>

            <div className="flex gap-2">
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, priority: p })
                  }
                  className={`flex-1 h-9 text-sm rounded-md border transition
                  ${
                    formData.priority === p
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 py-2 w-24 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 active:scale-95 transition"
            >
              {isSaving ? "Creating..." : "Create Task"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;