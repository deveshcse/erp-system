import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';
import { toast } from 'react-hot-toast';
import EmployeeTable from '../../components/employees/EmployeeTable';
import EmployeeForm from '../../components/employees/EmployeeForm';

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, limit: 8, search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [creationSuccessData, setCreationSuccessData] = useState(null);

  // Fetch Employees
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getAll(params),
  });

  // Mutate: Add Employee
  const addMutation = useMutation({
    mutationFn: (newEmp) => employeesApi.create(newEmp),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['employees']);
      setCreationSuccessData(response.data.data);
      toast.success('Employee record created');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    }
  });

  // Mutate: Edit Employee
  const editMutation = useMutation({
    mutationFn: (updatedEmp) => employeesApi.update(selectedEmployee._id, updatedEmp),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      closeModal();
      toast.success('Employee details updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    }
  });

  // Mutate: Delete Employee
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success('Employee deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  });

  const handleSearch = (e) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const openModal = (emp = null) => {
    setSelectedEmployee(emp);
    setCreationSuccessData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setCreationSuccessData(null);
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
  const pagination = data?.data?.data?.pagination || { totalPages: 1, page: 1 };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your company workforce
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm"
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
          Add Employee
        </button>
      </div>

      <div className="flex-shrink-0">
        <div className="relative">
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
            placeholder="Search by name, email or department..."
            value={params.search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {error && (
        <div className="flex-shrink-0 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Failed to load employees. Please try again.
        </div>
      )}

      {/* Main Container for Table and Pagination */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <EmployeeTable
          employees={employees}
          onEdit={openModal}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {creationSuccessData ? 'Employee Created Successfully' : selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {creationSuccessData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Please share these login credentials with the employee.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                      <p className="text-lg font-bold text-gray-900 mt-1">{creationSuccessData.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Default Password</label>
                      <p className="text-lg font-bold text-gray-900 mt-1">Employee@123</p>
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
                  <EmployeeForm
                    employee={selectedEmployee}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    isSubmitting={addMutation.isLoading || editMutation.isLoading}
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

export default EmployeeList;
