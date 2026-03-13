import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch Attendance Records
  const { data: attendanceData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceApi.getAll(filters),
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
    },
  });

  const handleMarkAttendance = (formData) => {
    markMutation.mutate(formData);
  };

  const records = attendanceData?.data?.data?.history || [];
  const reports = reportData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Attendance Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track employee presence and generate reports</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Mark Attendance
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex p-1 bg-gray-50 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'report' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly Report
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="text-xs border-none bg-gray-50 rounded-md focus:ring-0 px-2 py-1.5 w-full font-medium"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="text-xs border-none bg-gray-50 rounded-md focus:ring-0 px-2 py-1.5 w-full font-medium"
            />
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        <AttendanceTable records={records} isLoading={isLoadingRecords} />
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
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
                  <tr key={report.employeeId || Math.random()} className="hover:bg-gray-50/50 transition-colors">
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
