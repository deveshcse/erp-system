import { formatDate, formatCurrency } from "../../utils/formatters";
import { Users } from "lucide-react";

const EmployeeTable = ({ employees, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <Users size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No employees found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department & Role</th>
            <th>Joined Date</th>
            <th>Salary</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {employees.map((emp) => (
            <tr key={emp._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                    {emp.fullName?.[0] || "E"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {emp.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 font-medium">
                  {emp.designation}
                </p>
                <p className="text-xs text-gray-500">{emp.department}</p>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(emp.joiningDate)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(emp.salary)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${
                    emp.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(emp)}
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(emp._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
