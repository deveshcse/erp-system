import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { leadsApi } from '../../api/leads.api';
import LeadTable from '../../components/leads/LeadTable';
import LeadForm from '../../components/leads/LeadForm';

const LeadsPage = () => {
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('All'); // All, NEW, CONTACTED, NEGOTIATION, CLOSED, LOST
  const [params, setParams] = useState({ page: 1, limit: 8 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Fetch Leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', params, activeFilter],
    queryFn: () => leadsApi.getAll({ 
      ...params, 
      status: activeFilter === 'All' ? undefined : activeFilter 
    }),
  });

  // Create Lead Mutation
  const createMutation = useMutation({
    mutationFn: (data) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      closeModal();
      toast.success('Lead created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    }
  });

  // Update Lead Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      closeModal();
      toast.success('Lead updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => leadsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  const handlePageChange = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const leadsResult = leadsData?.data?.data;
  const leads = leadsResult?.leads || [];
  const pagination = leadsResult?.pagination || { totalPages: 1, page: 1 };

  // Summary Stats based on full data if available, or just the current view
  // Note: Backend ideally returns these, but for now we calculate from the current page/metadata
  const stats = {
    total: leadsResult?.totalLeads || leads.length,
    new: leadsResult?.statusCounts?.NEW || leads.filter(l => l.status === 'NEW').length,
    contacted: leadsResult?.statusCounts?.CONTACTED || leads.filter(l => l.status === 'CONTACTED').length,
    negotiation: leadsResult?.statusCounts?.NEGOTIATION || leads.filter(l => l.status === 'NEGOTIATION').length,
    closed: leadsResult?.statusCounts?.CLOSED || leads.filter(l => l.status === 'CLOSED').length,
    lost: leadsResult?.statusCounts?.LOST || leads.filter(l => l.status === 'LOST').length,
  };

  const handleSave = (data) => {
    if (editingLead) {
      updateMutation.mutate({ id: editingLead._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openModal = (lead = null) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingLead(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Lead Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and build relationships with potential customers
          </p>
        </div>
        <button
          onClick={() => openModal()}
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
          Add Lead
        </button>
      </div>

      {/* Stats Summary */}
      <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Leads", value: stats.total, color: "gray" },
          { label: "New", value: stats.new, color: "blue" },
          { label: "Contacted", value: stats.contacted, color: "yellow" },
          { label: "Negotiation", value: stats.negotiation, color: "purple" },
          { label: "Closed", value: stats.closed, color: "green" },
          { label: "Lost", value: stats.lost, color: "red" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className={`text-2xl font-black mt-1 text-${stat.color}-600`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 flex p-1 bg-gray-50 rounded-lg w-full overflow-x-auto border border-gray-100 shadow-sm no-scrollbar">
        {[
          { label: "All", value: "All" },
          { label: "New", value: "NEW" },
          { label: "Contacted", value: "CONTACTED" },
          { label: "Negotiation", value: "NEGOTIATION" },
          { label: "Closed", value: "CLOSED" },
          { label: "Lost", value: "LOST" },
        ].map((filter) => (
          <button
             disabled = {true}
            key={filter.value}
            onClick={() => {
              setActiveFilter(filter.value);
              setParams((prev) => ({ ...prev, page: 1 }));
            }}
            className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 whitespace-nowrap ${
              activeFilter === filter.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Main Container for Table and Pagination */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          onStatusUpdate={(id, status) =>
            updateStatusMutation.mutate({ id, status })
          }
          onEdit={openModal}
        />

        {/* Fixed Pagination at Bottom */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page {pagination.page} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
               disabled = {true}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            >
              Previous
            </button>
            <button
               disabled = {true}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <LeadForm
          initialData={editingLead}
          onSave={handleSave}
          onCancel={closeModal}
          isSaving={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

export default LeadsPage;
