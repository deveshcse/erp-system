import { formatCurrency } from "../../utils/formatters";
import { Users } from "lucide-react";

const SalaryStructureTable = ({ employees, onEdit, isLoading }) => {
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
            <th>Basic Pay</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {employees.map((emp) => (
            <tr key={emp._id} className="hover:bg-gray-50 transition">
              {/* Employee Column */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                    {emp.fullName?.[0] || "E"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {emp.fullName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {emp.employeeId}
                    </p>
                  </div>
                </div>
              </td>

              {/* Basic Pay */}
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-700">
                  {formatCurrency(emp.salary || 0)}
                </p>
              </td>

              {/* Allowances */}
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-green-600">
                  +{formatCurrency(emp.allowances || 0)}
                </p>
              </td>

              {/* Deductions */}
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-red-600">
                  -{formatCurrency(emp.deductions || 0)}
                </p>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(emp)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  title="Edit Structure"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalaryStructureTable;
