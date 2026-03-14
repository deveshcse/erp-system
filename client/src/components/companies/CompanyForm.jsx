import { useState } from 'react';

const CompanyForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    contactNumber: '',
    gstNumber: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transform flat state into nested structure expected by backend
    const payload = {
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      companyAddress: formData.companyAddress,
      contactNumber: formData.contactNumber,
      gstNumber: formData.gstNumber,
      adminData: {
        name: formData.adminName,
        email: formData.adminEmail,
        password: formData.adminPassword,
      }
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Company Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Company Email</label>
            <input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="contact@acmecorp.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">GST Number (Optional)</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="GST123456789"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Company Address</label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition resize-none"
              placeholder="123 Business Way, Suite 100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Admin User Details</h3>
        <p className="text-xs text-gray-500 mb-2">This user will be created as the Company Admin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Admin Name</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="Admin Name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="admin@acmecorp.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Temporary Password</label>
            <input
              type="password"
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 outline-none transition"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Creating...' : 'Create Company'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;
