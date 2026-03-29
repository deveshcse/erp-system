import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../api/attendance.api';
import { useAuth } from '../../context/AuthContext';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import MarkAttendanceForm from '../../components/attendance/MarkAttendanceForm';

const AttendancePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'report'
  const [params, setParams] = useState({ page: 1, limit: 8 });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch Attendance Records
  const { data: attendanceData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['attendance', filters, params],
    queryFn: () => attendanceApi.getAll({ ...filters, ...params }),
  });

  // Fetch Monthly Report
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['attendance-report', filters],
    queryFn: () => {
      const date = new Date(filters.startDate);
      return attendanceApi.getReport({
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    },
    enabled: activeTab === 'report',
  });

  // Mark Attendance Mutation
  const markMutation = useMutation({
    mutationFn: (data) => attendanceApi.mark(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
      setIsModalOpen(false);
      toast.success('Attendance marked successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  });

  const handleMarkAttendance = (formData) => {
    markMutation.mutate(formData);
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const attendanceResult = attendanceData?.data?.data;
  const records = attendanceResult?.history || [];
  const pagination = attendanceResult?.pagination || { totalPages: 1, page: 1 };
  const reports = reportData?.data?.data || [];

  return (
    <div className="flex flex-col h-full gap-6 text-[#1A1A1A]">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Attendance
            <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded uppercase tracking-[0.2em]">
              Log
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Track employee presence and generate reports
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-lg shadow-gray-200"
          >
            Mark Attendance
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="shrink-0 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex p-1 bg-gray-100 rounded-xl w-full lg:w-auto">
          <button
            onClick={() => {
              setActiveTab("history");
              setParams((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex-1 lg:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
          <button
            onClick={() => {
              setActiveTab("report");
              setParams((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex-1 lg:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === "report"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly Report
          </button>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-1 lg:flex-none bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              From
            </span>
            <input
              disabled = {true}
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, startDate: e.target.value }));
                setParams((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-xs border-none bg-transparent focus:ring-0 p-0 font-black w-28"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 lg:flex-none bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              To
            </span>
            <input
              disabled = {true}
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, endDate: e.target.value }));
                setParams((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-xs border-none bg-transparent focus:ring-0 p-0 font-black w-28"
            />
          </div>
        </div>
      </div>

      {activeTab === "history" ? (
        <div className="flex-1  min-h-0 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <AttendanceTable records={records} isLoading={isLoadingRecords} />

          {/* Fixed Pagination at Bottom */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {pagination.page} of {pagination.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled= {true}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={true}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto bg-white rounded-xl border border-gray-100 shadow-sm">
          {isLoadingReport ? (
             <div className="w-full h-64 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
           </div>
          ) : reports.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report.employeeId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{report.fullName}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">{report.employeeId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600 font-mono">
                      {report.totalPresent}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600 font-mono">
                      {report.totalAbsent}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 font-mono">
                      {report.totalLeave}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">
                      {Math.round(report.attendanceRate || 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 italic">
              No report data available for the selected range.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MarkAttendanceForm
                onSubmit={handleMarkAttendance}
                onCancel={() => setIsModalOpen(false)}
                isSubmitting={markMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
