import { formatCurrency } from '../../utils/formatters';

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
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No payslips found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month/Year</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Allow.</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deduct.</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days (W/L)</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Salary</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {payslips.map((slip) => (
            <tr key={slip._id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                {slip.month}
              </td>
              <td className="px-6 py-4">
                 <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                    {slip.employeeId?.fullName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{slip.employeeId?.fullName}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{slip.employeeId?.employeeId}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600">
                {formatCurrency(slip.basicSalary)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-green-600">
                +{formatCurrency(slip.allowances)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-red-600">
                -{formatCurrency(slip.deductions)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-600">
                <span className="text-gray-900 font-bold">{slip.workingDays}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-500">{slip.leaveDays}</span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                {formatCurrency(slip.netSalary)}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(slip)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-900 hover:text-white rounded-lg transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
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
