import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll.api';
import { employeesApi } from '../../api/employees.api';
import { useAuth } from '../../context/AuthContext';
import PayslipTable from '../../components/payroll/PayslipTable';
import PayslipCard from '../../components/payroll/PayslipCard';
import SalaryConfigModal from '../../components/payroll/SalaryConfigModal';
import { X } from 'lucide-react';

const PayrollPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('payslips'); // 'payslips' or 'salary-management'
  const [editingSalaryEmployee, setEditingSalaryEmployee] = useState(null);

  // Fetch Payslips (either for specific user or all if admin)
  const { data: payslipData, isLoading: isLoadingSlips } = useQuery({
    queryKey: ['payslips', isAdmin ? 'all' : user?._id, selectedMonth, selectedYear],
    queryFn: () => {
      const formattedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      return isAdmin 
        ? payrollApi.getAll({ month: formattedMonth })
        : payrollApi.getPayslips(user?._id, { month: formattedMonth });
    },
    enabled: !!user?._id && activeTab === 'payslips',
  });

  // Fetch All Employees (for salary management)
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', { limit: 1000 }],
    queryFn: () => employeesApi.getAll({ limit: 1000 }),
    enabled: isAdmin && activeTab === 'salary-management',
  });

  // Mutate: Update Salary Configuration (Uses employeesApi.update since backend usually stores these on employee)
  const updateSalaryMutation = useMutation({
    mutationFn: (data) => employeesApi.update(editingSalaryEmployee._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setEditingSalaryEmployee(null);
    },
  });

  // Mutate: Process Payroll
  const processMutation = useMutation({
    mutationFn: (data) => payrollApi.process(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['payslips']);
      setIsProcessModalOpen(false);
      setActiveTab('payslips');
    },
  });

  const handleProcess = () => {
    const formattedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    processMutation.mutate({ month: formattedMonth });
  };

  const handleSaveSalary = (data) => {
    updateSalaryMutation.mutate({
      salary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
    });
  };

  const payslips = payslipData?.data?.data || [];
  const employees = employeesData?.data?.data?.employees || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Payroll Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review, process, and manage employee salaries</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Process {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'short' })} Payroll
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="flex p-1 bg-gray-50 rounded-lg w-full sm:w-max border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('payslips')}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === 'payslips' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Payslip History
          </button>
          <button
            onClick={() => setActiveTab('salary-management')}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === 'salary-management' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Salary Structures
          </button>
        </div>
      )}

      {activeTab === 'payslips' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Filter Month</p>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0 px-3 py-2 font-bold cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Filter Year</p>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm border-none bg-gray-50 rounded-lg focus:ring-0 px-3 py-2 font-bold cursor-pointer"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <PayslipTable payslips={payslips} onView={setSelectedSlip} isLoading={isLoadingSlips} />
        </div>
      )}

      {activeTab === 'salary-management' && (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
          {isLoadingEmployees ? (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Base Pay</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Allowances</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Deductions</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{emp.fullName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{emp.employeeId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">${Number(emp.salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-mono text-green-600">+${Number(emp.allowances || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-mono text-red-600">-${Number(emp.deductions || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setEditingSalaryEmployee(emp)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
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
          )}
        </div>
      )}

      {/* Payslip Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSlip(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="overflow-y-auto max-h-[90vh]">
              <PayslipCard payslip={selectedSlip} onClose={() => setSelectedSlip(null)} />
            </div>
            <button 
              onClick={() => setSelectedSlip(null)} 
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-900 transition-all print:hidden"
            >
              <X className='border-1 rounded-full size-8'/>
            </button>
          </div>
        </div>
      )}

      {/* Salary Config Modal */}
      {editingSalaryEmployee && (
        <SalaryConfigModal 
          employee={editingSalaryEmployee}
          onSave={handleSaveSalary}
          onCancel={() => setEditingSalaryEmployee(null)}
          isSaving={updateSalaryMutation.isLoading}
        />
      )}

      {/* Process Confirm Modal */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsProcessModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Run Payroll Calculation</h3>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                This will generate official payslips for all employees for 
                <span className="text-gray-900 font-bold"> {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleProcess}
                disabled={processMutation.isLoading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-50"
              >
                {processMutation.isLoading ? 'Calculating...' : 'Start Calculation'}
              </button>
              <button 
                onClick={() => setIsProcessModalOpen(false)}
                className="w-full py-3 text-gray-500 text-sm font-bold hover:bg-gray-50 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
