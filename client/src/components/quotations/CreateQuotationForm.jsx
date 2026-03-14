import { useState, useEffect } from 'react';

const CreateQuotationForm = ({ onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    tax: 0,
    validityDate: '',
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  // Dynamically calculate totals
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
    // API expects totalAmount to be passed explicitly per schema
    onSave({ ...formData, totalAmount: totals.totalAmount });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Generate Quotation</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition hover:bg-gray-100 rounded-full p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          
          {/* Customer & Settings */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Name</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="e.g. Acme Corp"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Validity Date</label>
              <input
                type="date"
                required
                value={formData.validityDate}
                onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-1.5">
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
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full">Products / Services</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start relative group">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                      placeholder="Item Description"
                    />
                  </div>
                  <div className="w-24">
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
                  <div className="w-32">
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
                  <div className="w-28 pt-2 text-right">
                    <span className="font-bold text-gray-900 text-sm">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-8 flex items-center justify-center pt-1.5">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-300 hover:text-red-500 transition p-1"
                        title="Remove Item"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-gray-900 text-white p-5 rounded-xl shadow-lg mt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-400 font-bold">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 font-bold">
                <span>Tax ({formData.tax || 0}%)</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Total Amount</span>
              <span className="text-3xl font-black">${totals.totalAmount.toFixed(2)}</span>
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
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 shadow-lg shadow-gray-200 uppercase tracking-widest"
          >
            {isSaving ? 'Saving...' : 'Save Quotation'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateQuotationForm;
