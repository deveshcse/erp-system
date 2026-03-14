import { UserPlus } from "lucide-react";

const LeadTable = ({ leads, onStatusUpdate, onEdit, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!leads?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <UserPlus size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No leads found</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-700";
      case "CONTACTED":
        return "bg-yellow-100 text-yellow-700";
      case "NEGOTIATION":
        return "bg-purple-100 text-purple-700";
      case "CLOSED":
        return "bg-green-100 text-green-700";
      case "LOST":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="w-full text-left relative border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <tr className="text-sm text-gray-600">
            <th className="px-6 py-3 font-medium bg-gray-50">Lead Name</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Email</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Phone</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Status</th>
            <th className="px-6 py-3 font-medium bg-gray-50 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {lead.customerName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lead.companyName}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {lead.email}
                    </a>
                  )}
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 transition"
                  >
                    {lead.phone}
                  </a>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                  {lead.leadSource || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4">
                <select
                  value={lead.status}
                  onChange={(e) => onStatusUpdate(lead._id, e.target.value)}
                  className={`text-xs font-medium border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-gray-900 ${getStatusStyle(
                    lead.status
                  )} cursor-pointer transition-shadow appearance-none`}
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED">Closed</option>
                  <option value="LOST">Lost</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(lead)}
                  className="text-gray-400 hover:text-gray-900 transition p-1.5 hover:bg-gray-100 rounded-lg inline-flex"
                  title="Edit Lead"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
