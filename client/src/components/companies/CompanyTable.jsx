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
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact Person</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company._id}>
              <td>
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
              <td>
                <p className="text-sm font-medium text-gray-900">
                  {company.companyEmail}
                </p>
                <p className="text-xs text-gray-500">{company.contactNumber}</p>
              </td>
              <td className="text-sm text-gray-600">
                {company.gstNumber || "N/A"}
              </td>
              <td className="text-sm text-gray-600">
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
