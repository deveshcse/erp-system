import { useState, useEffect } from 'react';

const SalaryConfigModal = ({ employee, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    basicSalary: '',
    allowances: '',
    deductions: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        basicSalary: employee.salary || '',
        allowances: employee.allowances || '0',
        deductions: employee.deductions || '0',
      });
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      basicSalary: Number(formData.basicSalary),
      allowances: Number(formData.allowances),
      deductions: Number(formData.deductions),
    });
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            Manage Salary — <span className="text-gray-500 font-medium">{employee.fullName}</span>
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Basic Salary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Salary (Monthly)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  required
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-semibold text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Allowances */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Allowances</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-semibold text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deductions</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition font-semibold text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save Salary Configuration'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-gray-500 text-sm font-bold hover:bg-gray-50 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryConfigModal;
