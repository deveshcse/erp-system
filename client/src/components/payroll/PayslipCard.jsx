import { formatCurrency } from "../../utils/formatters";
import { Printer } from "lucide-react";

const PayslipCard = ({ payslip }) => {
  const handlePrint = () => window.print();

  if (!payslip) return null;

  const employee = payslip.employeeId;

  return (
    <div className="bg-white border rounded-xl shadow-sm">

      {/* Printable Area */}
      <div
        id="printable-payslip"
        className="p-6 space-y-6 print:p-8 print:text-black"
      >

        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Payslip
            </h1>
            <p className="text-sm text-gray-500">
              {payslip.month}
            </p>
          </div>

          <div className="text-right">
            <p className="font-medium text-gray-900">
              Test ERP Corp
            </p>
            <p className="text-xs text-gray-500">
              Corporate Headquarters
            </p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Employee</p>
            <p className="font-medium text-gray-900">
              {employee?.fullName}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Employee ID</p>
            <p className="font-medium text-gray-900">
              {employee?.employeeId}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium text-gray-900">
              {employee?.department}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Designation</p>
            <p className="font-medium text-gray-900">
              {employee?.designation}
            </p>
          </div>
        </div>

        {/* Attendance */}
        <div className="flex gap-6 text-sm border-t pt-4">
          <div>
            <p className="text-gray-500">Working Days</p>
            <p className="font-semibold text-gray-900">
              {payslip.workingDays}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Leave Days</p>
            <p className="font-semibold text-red-600">
              {payslip.leaveDays}
            </p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-2 gap-8 border-t pt-4 text-sm">

          {/* Earnings */}
          <div>
            <p className="font-medium text-gray-900 mb-2">
              Earnings
            </p>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Basic Salary
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(payslip.basicSalary)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Allowances
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(payslip.allowances || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <p className="font-medium text-gray-900 mb-2">
              Deductions
            </p>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Total Deductions
              </span>

              <span className="font-medium text-red-600">
                {formatCurrency(payslip.deductions || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="border-t pt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Net Salary
          </p>

          <p className="text-xl font-semibold text-gray-900">
            {formatCurrency(payslip.netSalary)}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end p-4 border-t print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
        >
          <Printer size={16} />
          Print / Download
        </button>
      </div>
    </div>
  );
};

export default PayslipCard;