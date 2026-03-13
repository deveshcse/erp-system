import apiClient from './client';

export const tasksApi = {
  /** Create and assign a new task — Admin only (POST /tasks) */
  create: (data) => apiClient.post('/tasks', data),

  /** View tasks — employees see own, admins see all in company (GET /tasks) */
  getAll: (params) => apiClient.get('/tasks', { params }),

  /** Update task status (PUT /tasks/{id}/status) */
  updateStatus: (id, status) => apiClient.put(`/tasks/${id}/status`, { status }),
};
