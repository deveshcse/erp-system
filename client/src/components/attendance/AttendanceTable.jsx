import { formatDate } from "../../utils/formatters";
import { CalendarCheck } from "lucide-react";

const AttendanceTable = ({ records, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!records?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <CalendarCheck size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No attendance records found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700";
      case "ABSENT":
        return "bg-red-100 text-red-700";
      case "LEAVE":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Status</th>
            <th>Clock In/Out</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {formatDate(record.date)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                    {record.employeeId?.fullName?.[0] || "E"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.employeeId?.fullName || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.employeeId?.employeeId}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs text-gray-600 flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {record.checkIn
                      ? new Date(record.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    {record.checkOut
                      ? new Date(record.checkOut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p
                  className="text-sm text-gray-500 truncate max-w-[200px]"
                  title={record.note}
                >
                  {record.note || "-"}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
