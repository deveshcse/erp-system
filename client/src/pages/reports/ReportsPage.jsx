import { FileText } from "lucide-react";

const ReportsPage = ({ reports = [] }) => {
  const isEmpty = reports.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>

      {isEmpty ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm py-20 flex flex-col items-center justify-center text-center">
          
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            No Reports Available
          </h2>

          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Reports will appear here once the system generates activity,
            billing, or error logs.
          </p>

          <button className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition">
            Generate Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-40 flex flex-col justify-between"
            >
              <p className="font-semibold text-gray-700">{report.title}</p>

              <button className="text-sm text-primary-600 font-medium hover:underline">
                Download CSV
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;