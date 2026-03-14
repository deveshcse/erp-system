import { formatDate } from '../../utils/formatters';

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
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">No quotations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Validity Date</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</th>
            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {quotations.map((quotation) => (
            <tr key={quotation._id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-gray-900">{quotation.customerName}</p>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                    {quotation.items.length} {quotation.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs font-bold text-gray-700">{formatDate(quotation.validityDate)}</p>
                {new Date(quotation.validityDate) < new Date() && (
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Expired</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-black text-gray-900">
                  ${quotation.totalAmount.toFixed(2)}
                </span>
                {quotation.tax > 0 && (
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">Incl. {quotation.tax}% Tax</p>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onView(quotation)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
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
