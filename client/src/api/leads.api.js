import apiClient from './client';

export const leadsApi = {
  /** Create a new lead (POST /leads) */
  create: (data) => apiClient.post('/leads', data),

  /** List leads with pagination and filters (GET /leads) */
  getAll: (params) => apiClient.get('/leads', { params }),

  /** Update lead details (PUT /leads/{id}) */
  update: (id, data) => apiClient.put(`/leads/${id}`, data),

  /** Delete a lead — Admin only (DELETE /leads/{id}) */
  delete: (id) => apiClient.delete(`/leads/${id}`),
};
