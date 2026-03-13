import apiClient from './client';

export const payrollApi = {
  /** Process payroll and generate payslip — Admin only (POST /payroll/process) */
  process: (data) => apiClient.post('/payroll/process', data),

  /** View payslips for a specific employee (GET /payroll/payslips/{employeeId}) */
  getPayslips: (employeeId, params) =>
    apiClient.get(`/payroll/payslips/${employeeId}`, { params }),

  /** View all payslips for the company — Admin only (GET /payroll/all) */
  getAll: (params) => apiClient.get('/payroll/all', { params }),
};
