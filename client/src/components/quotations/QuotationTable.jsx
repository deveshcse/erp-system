import { formatDate } from "../../utils/formatters";
import { FileText } from "lucide-react";

const QuotationTable = ({ quotations, onView, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quotations?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <FileText size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No quotations found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="table-standard">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Validity</th>
            <th>Total Amount</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {quotations.map((quotation) => (
            <tr key={quotation._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {quotation.customerName}
                </p>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {quotation.items.length}{" "}
                    {quotation.items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700">
                  {formatDate(quotation.validityDate)}
                </p>
                {new Date(quotation.validityDate) < new Date() && (
                  <span className="text-xs text-red-500 font-medium">
                    Expired
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{quotation.totalAmount.toFixed(2)}
                </span>
                {quotation.tax > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Incl. {quotation.tax}% Tax
                  </p>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(quotation)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationTable;
