import { formatCurrency } from "../../utils/formatters";
import { Wallet } from "lucide-react";

const PayslipTable = ({ payslips, onView, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!payslips?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <Wallet size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No payslips found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Month/Year</th>
            <th>Employee</th>
            <th>Structure</th>
            <th>Days (W/L)</th>
            <th>Net Salary</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {payslips.map((slip) => (
            <tr key={slip._id} className="hover:bg-gray-50 transition">
              {/* Month/Year */}
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {slip.month}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  Statement
                </p>
              </td>

              {/* Employee */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-black">
                    {slip.employeeId?.fullName?.[0] || "E"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {slip.employeeId?.fullName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {slip.employeeId?.employeeId}
                    </p>
                  </div>
                </div>
              </td>

              {/* Structure */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-600 font-medium">
                    <span className="text-[10px] text-gray-400 font-black uppercase mr-1">Base</span> {formatCurrency(slip.basicSalary)}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[10px] text-green-600 font-black">+{formatCurrency(slip.allowances)}</span>
                    <span className="text-[10px] text-red-600 font-black">-{formatCurrency(slip.deductions)}</span>
                  </div>
                </div>
              </td>

              {/* Attendance */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-700 rounded text-[10px] font-black">
                    {slip.workingDays}
                  </span>
                  <span className="text-gray-300 font-light text-xs">/</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-50 text-red-700 rounded text-[10px] font-black">
                    {slip.leaveDays}
                  </span>
                </div>
              </td>

              {/* Net Salary */}
              <td className="px-6 py-4">
                <p className="text-sm font-black text-gray-900 tracking-tight">
                  {formatCurrency(slip.netSalary)}
                </p>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(slip)}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayslipTable;
