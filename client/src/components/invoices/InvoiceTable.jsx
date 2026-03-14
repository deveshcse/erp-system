import { formatDate } from "../../utils/formatters";
import { ReceiptText } from "lucide-react";

const InvoiceTable = ({ invoices, onView, onStatusUpdate, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed">
        <ReceiptText size={40} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium">No invoices found</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border shadow-sm">
      <table className="w-full text-left relative border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <tr className="text-sm text-gray-600">
            <th className="px-6 py-3 font-medium bg-gray-50">Invoice No.</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Customer</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Amount</th>
            <th className="px-6 py-3 font-medium bg-gray-50">Status</th>
            <th className="px-6 py-3 font-medium bg-gray-50 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.map((invoice) => (
            <tr key={invoice._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900 font-mono tracking-tight">
                  {invoice.invoiceNumber}
                </p>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {invoice.customerName}
                </p>
                <span className="text-xs text-gray-400 mt-1 inline-block">
                  {invoice.items?.length || 0}{" "}
                  {(invoice.items?.length || 0) === 1 ? "Item" : "Items"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{(invoice.total || 0).toFixed(2)}
                </span>
                {invoice.tax > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Incl. {invoice.tax}% Tax
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <select
                  value={invoice.paymentStatus}
                  onChange={(e) => onStatusUpdate(invoice._id, e.target.value)}
                  className={`text-xs font-medium border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-gray-900 ${getStatusStyle(
                    invoice.paymentStatus
                  )} cursor-pointer transition-colors appearance-none`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(invoice)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition inline-flex items-center justify-center"
                  title="View Detail"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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

export default InvoiceTable;
