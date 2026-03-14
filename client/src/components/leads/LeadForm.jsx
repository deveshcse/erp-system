import { useState, useEffect } from 'react';

const LeadForm = ({ initialData, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    leadSource: '',
    status: 'NEW',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Lead' : 'Create New Lead'}</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition hover:bg-gray-100 rounded-full p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
            <input
              type="text"
              required
              value={formData.customerName || ''}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company</label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Source</label>
              <input
                type="text"
                value={formData.leadSource || ''}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-medium text-sm"
                placeholder="e.g. Website, Referral"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <div className="flex flex-wrap gap-2">
              {["NEW", "CONTACTED", "NEGOTIATION", "LOST", "CLOSED"].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`py-2 px-2 text-[10px] font-bold rounded-lg border transition-all truncate ${
                    formData.status === s 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 shadow-xl shadow-gray-100"
            >
              {isSaving ? 'Saving...' : (initialData ? 'Update Lead' : 'Create Lead')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
