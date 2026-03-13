const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-40 flex flex-col justify-between">
          <p className="font-semibold text-gray-700">User Activity Report</p>
          <button className="text-sm text-primary-600 font-medium hover:underline">Download CSV</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-40 flex flex-col justify-between">
          <p className="font-semibold text-gray-700">Company Billing Summary</p>
          <button className="text-sm text-primary-600 font-medium hover:underline">Download CSV</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-40 flex flex-col justify-between">
          <p className="font-semibold text-gray-700">Error Logs Report</p>
          <button className="text-sm text-primary-600 font-medium hover:underline">Download CSV</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
