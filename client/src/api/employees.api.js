import apiClient from './client';

export const employeesApi = {
  /** Get a paginated list of employees */
  getAll: (params) => apiClient.get('/employees', { params }),

  /** Get a single employee by ID */
  getById: (id) => apiClient.get(`/employees/${id}`),

  /** Create a new employee */
  create: (data) => apiClient.post('/employees', data),

  /** Update an existing employee */
  update: (id, data) => apiClient.put(`/employees/${id}`, data),

  /** Delete an employee */
  remove: (id) => apiClient.delete(`/employees/${id}`),
};
