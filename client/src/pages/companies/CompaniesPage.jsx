const CompaniesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
          Add Company
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 flex items-center justify-center text-gray-400 italic">
        Companies management list will appear here...
      </div>
    </div>
  );
};

export default CompaniesPage;
