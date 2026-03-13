import apiClient from './client';

export const attendanceApi = {
  /** Mark attendance for an employee — Admin only (POST /attendance/mark) */
  mark: (data) => apiClient.post('/attendance/mark', data),

  /** View attendance history (GET /attendance) */
  getAll: (params) => apiClient.get('/attendance', { params }),

  /** Generate monthly attendance report (GET /attendance/report) */
  getReport: (params) => apiClient.get('/attendance/report', { params }),
};
