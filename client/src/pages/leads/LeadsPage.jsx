import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../api/leads.api';
import LeadTable from '../../components/leads/LeadTable';
import LeadForm from '../../components/leads/LeadForm';

const LeadsPage = () => {
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('All'); // All, NEW, CONTACTED, NEGOTIATION, CLOSED, LOST
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Fetch Leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
  });

  // Create Lead Mutation
  const createMutation = useMutation({
    mutationFn: (data) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      closeModal();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to create lead');
    }
  });

  // Update Lead Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      closeModal();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update lead');
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => leadsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  });

  const leadsResult = leadsData?.data?.data;
  const leads = Array.isArray(leadsResult) ? leadsResult : (leadsResult?.leads || []);

  // Summary Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    negotiation: leads.filter(l => l.status === 'NEGOTIATION').length,
    closed: leads.filter(l => l.status === 'CLOSED').length,
    lost: leads.filter(l => l.status === 'LOST').length,
  };

  const filteredLeads = activeFilter === 'All' 
    ? leads 
    : leads.filter(l => l.status === activeFilter);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and build relationships with potential customers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition shadow-sm w-max"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'gray' },
          { label: 'New', value: stats.new, color: 'blue' },
          { label: 'Contacted', value: stats.contacted, color: 'yellow' },
          { label: 'Negotiation', value: stats.negotiation, color: 'purple' },
          { label: 'Closed', value: stats.closed, color: 'green' },
          { label: 'Lost', value: stats.lost, color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-gray-50 rounded-lg w-full overflow-x-auto border border-gray-100 shadow-sm no-scrollbar">
        {[
          { label: 'All', value: 'All' },
          { label: 'New', value: 'NEW' },
          { label: 'Contacted', value: 'CONTACTED' },
          { label: 'Negotiation', value: 'NEGOTIATION' },
          { label: 'Closed', value: 'CLOSED' },
          { label: 'Lost', value: 'LOST' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-200 whitespace-nowrap ${
              activeFilter === filter.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <LeadTable 
        leads={filteredLeads} 
        isLoading={isLoading} 
        onStatusUpdate={(id, status) => updateStatusMutation.mutate({ id, status })}
        onEdit={openModal}
      />

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
