import { formatDate } from '../../utils/formatters';

const CompanyTable = ({ companies, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!companies?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p>No companies found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">GST No.</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Dates</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {companies.map((company) => (
            <tr key={company._id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    {company.companyName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{company.companyName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]" title={company.companyAddress}>{company.companyAddress}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{company.companyEmail}</p>
                <p className="text-xs text-gray-500">{company.contactNumber}</p>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {company.gstNumber || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(company.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
