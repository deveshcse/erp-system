import { ROLES, RESOURCES, ACTIONS, type Role, type Resource, type Action } from "@/constants";

// ---------------------------------------------------------------------------
// Permission Matrix
//
// This is the SINGLE SOURCE OF TRUTH for all access control decisions.
// No role checks are scattered across controllers or services.
// Every "can this role do this action on this resource?" question
// is answered by this map alone.
//
// Structure:
//   permissions[Role][Resource] = Action[]
//
// ACTIONS.MANAGE is NOT automatically expanded here — it is a literal action
// that means "full control". The hasPermission helper handles the expansion.
// ---------------------------------------------------------------------------
type PermissionMap = {
  [R in Role]: Partial<{
    [Res in Resource]: Action[];
  }>;
};

export const permissions: PermissionMap = {
  // ─── SuperAdmin ──────────────────────────────────────────────────────────
  // SuperAdmin manages the platform itself (companies, platform users).
  // SuperAdmin does NOT have access to company-internal data (employees,
  // payroll, etc.) — that belongs to CompanyAdmin.
  [ROLES.SUPER_ADMIN]: {
    [RESOURCES.COMPANY]: [ACTIONS.MANAGE],
    [RESOURCES.USER]: [ACTIONS.MANAGE],
    [RESOURCES.SESSION]: [ACTIONS.READ, ACTIONS.DELETE],
    [RESOURCES.REPORT]: [ACTIONS.READ],
  },

  // ─── CompanyAdmin ────────────────────────────────────────────────────────
  // CompanyAdmin has full control over their own company's data.
  // The middleware layer enforces the "own company only" boundary — the
  // permission matrix only defines WHAT they can do, not WHICH company.
  [ROLES.COMPANY_ADMIN]: {
    [RESOURCES.EMPLOYEE]: [ACTIONS.MANAGE],
    [RESOURCES.ATTENDANCE]: [ACTIONS.MANAGE],
    [RESOURCES.PAYROLL]: [ACTIONS.MANAGE],
    [RESOURCES.PAYSLIP]: [ACTIONS.MANAGE],
    [RESOURCES.TASK]: [ACTIONS.MANAGE],
    [RESOURCES.LEAD]: [ACTIONS.MANAGE],
    [RESOURCES.QUOTATION]: [ACTIONS.MANAGE],
    [RESOURCES.INVOICE]: [ACTIONS.MANAGE],
    [RESOURCES.REPORT]: [ACTIONS.READ],
    [RESOURCES.USER]: [ACTIONS.READ],
    [RESOURCES.SESSION]: [ACTIONS.READ],
  },

  // ─── Employee ─────────────────────────────────────────────────────────────
  // Employees have read access to their own records and limited write access
  // (e.g. updating task status). The service layer enforces the "own data"
  // boundary on top of these permissions.
  [ROLES.EMPLOYEE]: {
    [RESOURCES.ATTENDANCE]: [ACTIONS.READ],
    [RESOURCES.PAYSLIP]: [ACTIONS.READ],
    [RESOURCES.TASK]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.USER]: [ACTIONS.READ, ACTIONS.UPDATE],
  },
};

// ---------------------------------------------------------------------------
// hasPermission
//
// The authoritative check: does `role` have `action` on `resource`?
//
// ACTIONS.MANAGE in the matrix means the role can perform ALL actions
// on that resource, so we expand it here rather than listing every action
// individually in the matrix.
// ---------------------------------------------------------------------------
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const allowedActions = rolePermissions[resource];
  if (!allowedActions || allowedActions.length === 0) return false;

  // MANAGE grants all actions
  if (allowedActions.includes(ACTIONS.MANAGE)) return true;

  return allowedActions.includes(action);
}

// ---------------------------------------------------------------------------
// getRolePermissions
//
// Returns the full permission set for a role — useful for debug endpoints
// or role-management UIs.
// ---------------------------------------------------------------------------
export function getRolePermissions(
  role: Role
): Partial<{ [R in Resource]: Action[] }> {
  return permissions[role] ?? {};
}
