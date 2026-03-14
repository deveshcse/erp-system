import { useState, useEffect } from 'react';

const InvoiceForm = ({ onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    tax: 0,
    paymentStatus: 'PENDING',
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  // Calculate totals dynamically
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const g = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.price) || 0;
      return sum + (g * p);
    }, 0);

    const taxAmount = subtotal * ((parseFloat(formData.tax) || 0) / 100);
    const totalAmount = subtotal + taxAmount;

    setTotals({ subtotal, taxAmount, totalAmount });
  }, [formData.items, formData.tax]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, total: totals.totalAmount });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Create New Invoice</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition hover:bg-gray-100 rounded-full p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          
          {/* Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Number</label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="INV-001"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Name</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="Acme Corp"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-1">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tax (%)</label>
               <input
                 type="number"
                 min="0"
                 step="0.1"
                 required
                 value={formData.tax}
                 onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                 className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
               />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Status</label>
              <div className="flex flex-wrap gap-2">
                {['PENDING', 'PARTIALLY_PAID', 'PAID'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentStatus: s })}
                    className={`py-2 px-3 text-[10px] font-bold rounded-lg border transition-all truncate ${
                      formData.paymentStatus === s 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-widest w-full border-b pb-2">Invoice Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition mb-2"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start relative group bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                      placeholder="Item Description"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                      placeholder="Qty"
                      title="Quantity"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                        placeholder="Price"
                        title="Unit Price"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-28 pt-2 sm:text-right flex justify-between sm:block border-t sm:border-0 mt-2 sm:mt-0">
                    <span className="font-bold text-gray-400 text-xs sm:hidden">Total:</span>
                    <span className="font-black text-gray-900 text-sm">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="absolute -top-2 -right-2 sm:relative sm:top-0 sm:right-0 sm:w-8 flex items-center justify-center pt-1">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 bg-white sm:bg-transparent rounded-full sm:rounded-none shadow-sm sm:shadow-none p-1 transition border sm:border-0"
                        title="Remove Item"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Totals Summary */}
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none"></div>
            
            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Subtotal</span>
                <span className="text-gray-200">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Tax ({formData.tax || 0}%)</span>
                <span className="text-gray-200">${totals.taxAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-5 border-t border-gray-700/50 flex justify-between items-end relative z-10">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Amount</span>
                <span className="text-[10px] text-gray-500 font-medium">{formData.paymentStatus.replace('_', ' ')}</span>
              </div>
              <span className="text-4xl font-black tracking-tight">${totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>

        </form>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition uppercase tracking-widest text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-[2] flex justify-center items-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200 uppercase tracking-widest"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>Generate Invoice</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceForm;
