import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

/**
 * A hook that provides permission checks for the current user.
 * @returns {{ isSuperAdmin, isCompanyAdmin, isEmployee, can }}
 */
const usePermissions = () => {
  const { user, hasPermission } = useAuth();

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isCompanyAdmin = user?.role === ROLES.COMPANY_ADMIN;
  const isEmployee = user?.role === ROLES.EMPLOYEE;

  /**
   * Check if the current user has one of the specified roles.
   * @param {string[]} roles
   * @returns {boolean}
   */
  const can = (roles) => hasPermission(roles);

  return { isSuperAdmin, isCompanyAdmin, isEmployee, can };
};

export default usePermissions;
