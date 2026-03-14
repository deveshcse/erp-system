import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '../../api/quotations.api';
import QuotationTable from '../../components/quotations/QuotationTable';
import CreateQuotationForm from '../../components/quotations/CreateQuotationForm';

const QuotationPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState(null);

  // Fetch Quotations (No pagination in UI currently, fetch all for client side rendering)
  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => quotationsApi.getAll({ limit: 1000 }), // Get all for simplified table rendering
  });

  // Create Quotation Mutation
  const createMutation = useMutation({
    mutationFn: (data) => quotationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotations']);
      setIsModalOpen(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to create quotation');
    }
  });

  const rawQuotations = quotationsData?.data?.data;
  const quotations = Array.isArray(rawQuotations) ? rawQuotations : (rawQuotations?.quotations || []);

  const stats = {
    total: quotations.length,
    totalValue: quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage service quotes for customers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm w-max"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Quotation
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Quotations Generated', value: stats.total, color: 'gray' },
          { label: 'Total Quoted Value', value: `$${stats.totalValue.toFixed(2)}`, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest w-1/2">{stat.label}</p>
            <p className={`text-3xl font-black mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quotation Table */}
      <QuotationTable 
        quotations={quotations} 
        isLoading={isLoading} 
        onView={(quotation) => setViewingQuotation(quotation)}
      />

      {isModalOpen && (
        <CreateQuotationForm
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setIsModalOpen(false)}
          isSaving={createMutation.isLoading}
        />
      )}

      {/* Read-only View Modal (Simplified for now) */}
      {viewingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingQuotation(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Quotation Summary</h3>
              <button onClick={() => setViewingQuotation(null)} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-gray-900 border-b pb-4">Customer: <span className="font-medium text-gray-600 ml-2">{viewingQuotation.customerName}</span></p>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</h4>
                {viewingQuotation.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">{item.name}</span>
                      <span className="text-xs text-gray-500 font-medium">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl">
                 <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Total</span>
                    <span className="text-xs text-gray-400">Includes {viewingQuotation.tax}% Tax</span>
                 </div>
                 <span className="text-2xl font-black">${viewingQuotation.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setViewingQuotation(null)} className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;
