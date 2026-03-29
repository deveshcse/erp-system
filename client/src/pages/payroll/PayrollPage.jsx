import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { payrollApi } from "../../api/payroll.api";
import { employeesApi } from "../../api/employees.api";
import { useAuth } from "../../context/AuthContext";
import PayslipTable from "../../components/payroll/PayslipTable";
import SalaryStructureTable from "../../components/payroll/SalaryStructureTable";
import PayslipCard from "../../components/payroll/PayslipCard";
import SalaryConfigModal from "../../components/payroll/SalaryConfigModal";
import { X } from "lucide-react";

const PayrollPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin =
    user?.role === "SUPER_ADMIN" || user?.role === "COMPANY_ADMIN";

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("payslips"); // 'payslips' or 'salary-management'
  const [editingSalaryEmployee, setEditingSalaryEmployee] = useState(null);

  // Pagination states
  const [payslipParams, setPayslipParams] = useState({ page: 1, limit: 10 });
  const [employeeParams, setEmployeeParams] = useState({ page: 1, limit: 10 });

  // Fetch Payslips (either for specific user or all if admin)
  const { data: payslipData, isLoading: isLoadingSlips } = useQuery({
    queryKey: [
      "payslips",
      isAdmin ? "all" : "my",
      selectedMonth,
      selectedYear,
      payslipParams,
    ],
    queryFn: () => {
      const formattedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      const params = { ...payslipParams, month: formattedMonth };
      return isAdmin
        ? payrollApi.getAll(params)
        : payrollApi.getMyPayslips(params);
    },
    enabled: !!user?._id && activeTab === "payslips",
  });

  // Fetch All Employees (for salary management)
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", employeeParams],
    queryFn: () => employeesApi.getAll(employeeParams),
    enabled: isAdmin && activeTab === "salary-management",
  });

  // Mutate: Update Salary Configuration (Uses employeesApi.update since backend usually stores these on employee)
  const updateSalaryMutation = useMutation({
    mutationFn: (data) => employeesApi.update(editingSalaryEmployee._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      setEditingSalaryEmployee(null);
      toast.success("Salary structure updated");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to update salary structure",
      );
    },
  });

  // Mutate: Process Payroll
  const processMutation = useMutation({
    mutationFn: (data) => payrollApi.process(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["payslips"]);
      setIsProcessModalOpen(false);
      setActiveTab("payslips");
      toast.success("Monthly payroll processed successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to process payroll");
    },
  });

  const handleProcess = () => {
    const formattedMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    processMutation.mutate({ month: formattedMonth });
  };

  const handleSaveSalary = (data) => {
    updateSalaryMutation.mutate({
      salary: data.basicSalary,
      allowances: data.allowances,
      deductions: data.deductions,
    });
  };

  const payslipsResult = payslipData?.data?.data;
  const payslips = Array.isArray(payslipsResult)
    ? payslipsResult
    : payslipsResult?.payslips || [];
  const payslipPagination = payslipsResult?.pagination || {
    totalPages: 1,
    page: 1,
  };

  const employeesResult = employeesData?.data?.data;
  const employees = employeesResult?.employees || [];
  const employeePagination = employeesResult?.pagination || {
    totalPages: 1,
    page: 1,
  };

  const handlePayslipPageChange = (newPage) => {
    setPayslipParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleEmployeePageChange = (newPage) => {
    setEmployeeParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Payroll Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, process, and manage employee salaries
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Process{" "}
            {new Date(0, selectedMonth - 1).toLocaleString("default", {
              month: "short",
            })}{" "}
            Payroll
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="flex-shrink-0 flex p-1 bg-gray-50 rounded-lg w-full sm:w-max border border-gray-100 shadow-sm">
          <button
            onClick={() => {
              setActiveTab("payslips");
              setPayslipParams((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === "payslips"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payslip History
          </button>
          <button
            onClick={() => {
              setActiveTab("salary-management");
              setEmployeeParams((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === "salary-management"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manage Salary Structures
          </button>
        </div>
      )}

      {activeTab === "payslips" && (
        <div className="flex-1 min-h-0 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <PayslipTable
            payslips={payslips}
            onView={setSelectedSlip}
            isLoading={isLoadingSlips}
          />

          {/* Fixed Pagination at Bottom for Payslips */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {payslipPagination.page} of{" "}
              {payslipPagination.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled={true}
                onClick={() =>
                  handlePayslipPageChange(payslipPagination.page - 1)
                }
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={true}
                onClick={() =>
                  handlePayslipPageChange(payslipPagination.page + 1)
                }
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "salary-management" && (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <SalaryStructureTable
            employees={employees}
            onEdit={setEditingSalaryEmployee}
            isLoading={isLoadingEmployees}
          />

          {/* Fixed Pagination at Bottom for Salary Management */}
          {!isLoadingEmployees && (
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50 mt-auto">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {employeePagination.page} of{" "}
                {employeePagination.totalPages || 1}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={true}
                  onClick={() =>
                    handleEmployeePageChange(employeePagination.page - 1)
                  }
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  Previous
                </button>
                <button
                  disabled={true}
                  onClick={() =>
                    handleEmployeePageChange(employeePagination.page + 1)
                  }
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payslip Detail Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedSlip(null)}
          ></div>
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="overflow-y-auto max-h-[90vh]">
              <PayslipCard
                payslip={selectedSlip}
                onClose={() => setSelectedSlip(null)}
              />
            </div>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-900 transition-all print:hidden"
            >
              <X className="border-1 rounded-full size-8" />
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsProcessModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Run Payroll Calculation
              </h3>
              <p className="text-gray-500 text-xs mt-2 font-medium">
                This will generate official payslips for all employees for
                <span className="text-gray-900 font-bold">
                  {" "}
                  {new Date(0, selectedMonth - 1).toLocaleString("default", {
                    month: "long",
                  })}{" "}
                  {selectedYear}
                </span>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleProcess}
                disabled={processMutation.isLoading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 disabled:opacity-50"
              >
                {processMutation.isLoading
                  ? "Calculating..."
                  : "Start Calculation"}
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
