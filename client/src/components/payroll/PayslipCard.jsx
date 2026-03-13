import { formatCurrency } from '../../utils/formatters';

const PayslipCard = ({ payslip }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!payslip) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Printable Area */}
      <div id="printable-payslip" className="p-8 space-y-8 bg-white print:p-12 print:text-black">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-8 print:border-black">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter print:text-2xl italic">PAYSLIP</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1 print:text-black font-mono">
              Month of {payslip.month}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-900 print:text-lg">Test ERP Corp</h2>
            <p className="text-xs text-gray-500 print:text-black mt-0.5">Corporate Headquarters, Tech Valley</p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-xl print:bg-transparent print:border print:border-black print:rounded-none">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black font-mono">Employee Name</p>
              <p className="font-bold text-gray-900 print:text-black">{payslip.employeeId?.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black font-mono">Employee ID</p>
              <p className="font-bold text-gray-900 print:text-black">{payslip.employeeId?.employeeId}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black font-mono">Designation</p>
              <p className="font-bold text-gray-900 print:text-black">{payslip.employeeId?.designation}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black font-mono">Department</p>
              <p className="font-bold text-gray-900 print:text-black">{payslip.employeeId?.department}</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-2 gap-4 border-y border-dashed border-gray-100 py-6 print:border-black">
          <div className="text-center border-r border-gray-100 print:border-black">
            <p className="text-[10px] font-bold text-gray-400 uppercase font-mono print:text-black">Working Days</p>
            <p className="text-lg font-black text-gray-900 print:text-black font-mono">{payslip.workingDays}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase font-mono print:text-black">Leave Days</p>
            <p className="text-lg font-black text-red-600 print:text-black font-mono">{payslip.leaveDays}</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-2 print:border-black">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium print:text-black">Basic Salary</span>
                <span className="font-bold text-gray-900 print:text-black">{formatCurrency(payslip.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium print:text-black">Allowances</span>
                <span className="font-bold text-gray-900 print:text-black">{formatCurrency(payslip.allowances || 0)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-2 print:border-black">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium print:text-black">Deductions</span>
                <span className="font-bold text-red-600 print:text-black">{formatCurrency(payslip.deductions || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-gray-900 text-white p-8 rounded-2xl flex justify-between items-center print:bg-transparent print:text-black print:border-2 print:border-black print:rounded-none">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black font-mono">Net Salary Payable</p>
            <p className="text-3xl font-black tracking-tighter print:text-3xl">{formatCurrency(payslip.netSalary)}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-mono hidden print:block mt-8">Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="p-8 pt-0 flex justify-end gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default PayslipCard;
