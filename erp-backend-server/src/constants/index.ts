// ---------------------------------------------------------------------------
// Roles — the three tiers in the system hierarchy.
// ---------------------------------------------------------------------------
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  COMPANY_ADMIN: "CompanyAdmin",
  EMPLOYEE: "Employee",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ---------------------------------------------------------------------------
// Resources — every entity in the system that can be protected.
// ---------------------------------------------------------------------------
export const RESOURCES = {
  // Platform-level (SuperAdmin scope)
  COMPANY: "company",

  // Company-level (CompanyAdmin scope)
  EMPLOYEE: "employee",
  ATTENDANCE: "attendance",
  PAYROLL: "payroll",
  PAYSLIP: "payslip",
  TASK: "task",
  LEAD: "lead",
  QUOTATION: "quotation",
  INVOICE: "invoice",

  // Cross-cutting
  USER: "user",
  SESSION: "session",
  REPORT: "report",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

// ---------------------------------------------------------------------------
// Actions — the verbs that can be performed on a resource.
// ---------------------------------------------------------------------------
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Shorthand for full CRUD — used for convenience
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// ---------------------------------------------------------------------------
// HTTP Status Codes — centralised so status codes are never hardcoded.
// ---------------------------------------------------------------------------
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// ---------------------------------------------------------------------------
// Error Codes — machine-readable codes the frontend can switch on.
// Each code maps to exactly one error scenario.
// ---------------------------------------------------------------------------
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  TOKEN_MISSING: "TOKEN_MISSING",
  REFRESH_TOKEN_REUSED: "REFRESH_TOKEN_REUSED", // Token rotation violation
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  MAX_SESSIONS_REACHED: "MAX_SESSIONS_REACHED",

  // Authorisation
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  COMPANY_NOT_FOUND: "COMPANY_NOT_FOUND",
  EMPLOYEE_NOT_FOUND: "EMPLOYEE_NOT_FOUND",

  // Multi-tenancy
  TENANT_MISMATCH: "TENANT_MISMATCH",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ---------------------------------------------------------------------------
// Cookie names — kept consistent across auth middleware and controllers.
// ---------------------------------------------------------------------------
export const COOKIE_NAMES = {
  REFRESH_TOKEN: "erp_refresh_token",
} as const;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ---------------------------------------------------------------------------
// Employee status values
// ---------------------------------------------------------------------------
export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

// ---------------------------------------------------------------------------
// Attendance status values
// ---------------------------------------------------------------------------
export const ATTENDANCE_STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "Leave",
  HALF_DAY: "HalfDay",
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// ---------------------------------------------------------------------------
// Task status and priority values
// ---------------------------------------------------------------------------
export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "InProgress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

// ---------------------------------------------------------------------------
// Lead status values
// ---------------------------------------------------------------------------
export const LEAD_STATUS = {
  NEW: "New",
  CONTACTED: "Contacted",
  NEGOTIATION: "Negotiation",
  CLOSED: "Closed",
  LOST: "Lost",
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const LEAD_SOURCE = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "SocialMedia",
  COLD_CALL: "ColdCall",
  EMAIL: "Email",
  OTHER: "Other",
} as const;

export type LeadSource = (typeof LEAD_SOURCE)[keyof typeof LEAD_SOURCE];

// ---------------------------------------------------------------------------
// Payment status values
// ---------------------------------------------------------------------------
export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIALLY_PAID: "PartiallyPaid",
  CANCELLED: "Cancelled",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
