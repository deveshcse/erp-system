import apiClient from './client';

export const companiesApi = {
  /** Create a new company and its admin user (POST /companies) */
  create: (data) => apiClient.post('/companies', data),

  /** List all companies with pagination (GET /companies) */
  getAll: (params) => apiClient.get('/companies', { params }),

  /** Get company statistics (GET /companies/stats) */
  getStats: () => apiClient.get('/companies/stats'),

  /** Get company details by ID (GET /companies/{id}) */
  getById: (id) => apiClient.get(`/companies/${id}`),
};
