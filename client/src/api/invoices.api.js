import apiClient from './client';

export const invoicesApi = {
  /** Create a new invoice — Admin only (POST /invoices) */
  create: (data) => apiClient.post('/invoices', data),

  /** List invoices (GET /invoices) */
  getAll: (params) => apiClient.get('/invoices', { params }),

  /** Get invoice details (GET /invoices/{id}) */
  getById: (id) => apiClient.get(`/invoices/${id}`),
};
