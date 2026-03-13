import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';

const MarkAttendanceForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    status: 'PRESENT',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Fetch all employees to select from
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', { limit: 1000 }], // Fetch all for dropdown
    queryFn: () => employeesApi.getAll({ limit: 1000 }),
  });

  const employees = employeesData?.data?.data?.employees || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Employee Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Select Employee</label>
          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
            disabled={isLoadingEmployees}
          >
            <option value="">Choose an employee...</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} ({emp.employeeId})
              </option>
            ))}
          </select>
          {isLoadingEmployees && <p className="text-xs text-gray-400">Loading employees...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition bg-white"
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Note (Optional)</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Additional comments..."
            rows="3"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
          ></textarea>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-sans">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingEmployees}
          className="px-6 py-2 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Marking...' : 'Mark Attendance'}
        </button>
      </div>
    </form>
  );
};

export default MarkAttendanceForm;
