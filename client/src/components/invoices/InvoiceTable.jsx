import { formatDate } from '../../utils/formatters';

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
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">No invoices found</p>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'PARTIALLY_PAID': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Invoice Details</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoices.map((invoice) => (
            <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-gray-900 font-mono tracking-tight">{invoice.invoiceNumber}</p>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-gray-900">{invoice.customerName}</p>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                  {invoice.items?.length || 0} {(invoice.items?.length || 0) === 1 ? 'Item' : 'Items'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-black text-gray-900">
                  ${(invoice.total || 0).toFixed(2)}
                </span>
                {invoice.tax > 0 && (
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">Incl. {invoice.tax}% Tax</p>
                )}
              </td>
              <td className="px-6 py-4">
                <select
                  value={invoice.paymentStatus}
                  onChange={(e) => onStatusUpdate(invoice._id, e.target.value)}
                  className={`text-[10px] font-bold border rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 ${getStatusStyle(invoice.paymentStatus)} cursor-pointer transition-colors appearance-none`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(invoice)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex items-center justify-center"
                  title="View Detail"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
