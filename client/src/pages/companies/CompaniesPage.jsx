import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../../api/companies.api';
import CompanyTable from '../../components/companies/CompanyTable';
import CompanyForm from '../../components/companies/CompanyForm';

const CompaniesPage = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 8, search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationSuccessData, setCreationSuccessData] = useState(null);

  // Fetch Companies
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', params],
    queryFn: () => companiesApi.getAll(params),
  });

  // Mutate: Add Company
  const addMutation = useMutation({
    mutationFn: (newCompany) => companiesApi.create(newCompany),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['companies']);
      setCreationSuccessData(response.data.data);
    },
  });

  const handleSearch = (e) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const openModal = () => {
    setCreationSuccessData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCreationSuccessData(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    addMutation.mutate(formData);
  };

  const companies = data?.data?.data?.companies || [];
  const pagination = data?.data?.data?.pagination || { totalPages: 1, page: 1 };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Companies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all companies and systems in the network
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm w-max"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search companies..."
            value={params.search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Alerts */}
      {(error || addMutation.isError) && (
        <div className="flex-shrink-0 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Failed to load companies. Please try again.
            </div>
          )}
          {addMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Failed to create company:{" "}
              {addMutation.error?.response?.data?.message ||
                addMutation.error?.message}
            </div>
          )}
        </div>
      )}

      {/* Main Container for Table and Pagination */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <CompanyTable companies={companies} isLoading={isLoading} />

        {/* Fixed Pagination at Bottom */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page {pagination.page} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {creationSuccessData
                  ? "Company Created Successfully"
                  : "Add New Company"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-900 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {creationSuccessData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      Company and Admin user have been created. Please share these
                      credentials with the Company Admin.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin Email
                      </label>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {creationSuccessData.admin?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Login Role
                      </label>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        COMPANY_ADMIN
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[80vh]">
                  <CompanyForm
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    isSubmitting={addMutation.isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
