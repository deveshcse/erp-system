import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';
import EmployeeTable from '../../components/employees/EmployeeTable';
import EmployeeForm from '../../components/employees/EmployeeForm';

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch Employees
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getAll(params),
  });

  // Mutate: Add Employee
  const addMutation = useMutation({
    mutationFn: (newEmp) => employeesApi.create(newEmp),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      closeModal();
    },
  });

  // Mutate: Edit Employee
  const editMutation = useMutation({
    mutationFn: (updatedEmp) => employeesApi.update(selectedEmployee._id, updatedEmp),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      closeModal();
    },
  });

  // Mutate: Delete Employee
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
    },
  });

  const handleSearch = (e) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const openModal = (emp = null) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (selectedEmployee) {
      editMutation.mutate(formData);
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const employees = data?.data?.data?.employees || [];
  const pagination = data?.data?.data?.pagination || { totalPages: 1, currentPage: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Employee Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your company workforce</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={params.search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Failed to load employees. Please try again.
        </div>
      )}

      <EmployeeTable
        employees={employees}
        onEdit={openModal}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <EmployeeForm
                employee={selectedEmployee}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                isSubmitting={addMutation.isLoading || editMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
