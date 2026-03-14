import { formatDate } from "../../utils/formatters";
import { Building2 } from "lucide-react";

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
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <Building2 size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No companies found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border shadow-sm">
      <table className="w-full text-left relative border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <tr className="text-sm text-gray-600">
            <th className="px-6 py-3 font-medium bg-gray-50">Company</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Contact Person</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Status</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {companies.map((company) => (
            <tr key={company._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
                    {company.companyName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.companyName}
                    </p>
                    <p
                      className="text-xs text-gray-500 truncate max-w-[200px]"
                      title={company.companyAddress}
                    >
                      {company.companyAddress}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {company.companyEmail}
                </p>
                <p className="text-xs text-gray-500">{company.contactNumber}</p>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {company.gstNumber || "N/A"}
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
