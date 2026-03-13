import apiClient from './client';

export const quotationsApi = {
  /** Create a new quotation (POST /quotations) */
  create: (data) => apiClient.post('/quotations', data),

  /** List quotations (GET /quotations) */
  getAll: (params) => apiClient.get('/quotations', { params }),

  /** Get quotation details (GET /quotations/{id}) */
  getById: (id) => apiClient.get(`/quotations/${id}`),
};
