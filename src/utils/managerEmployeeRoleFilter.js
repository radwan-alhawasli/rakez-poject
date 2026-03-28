/**
 * Filter employees so a manager only sees staff of the same role (department).
 * e.g. editor manager (type editor) → only editor employees.
 * Admin managers: no filter (see all returned by API).
 */

import { normalizeRole } from '@/utils/rbac';
import { ROLE_ADMIN } from '@/constants/roles';

/**
 * @param {unknown} emp - user row from API (may have type, user_type, role, or nested user)
 * @returns {number|null}
 */
export function getEmployeeRoleType(emp) {
  if (!emp || typeof emp !== 'object') return null;
  const u = emp.user && typeof emp.user === 'object' ? emp.user : null;
  return normalizeRole(
    emp.type ?? emp.user_type ?? emp.role ?? u?.type ?? u?.role ?? u?.user_type
  );
}

/**
 * @param {Array} employees
 * @param {object|null} managerUser - current user (must have .type)
 * @returns {Array}
 */
export function filterEmployeesByManagerRole(employees, managerUser) {
  if (!Array.isArray(employees)) return [];
  const mgr = normalizeRole(managerUser?.type);
  if (mgr === null || mgr === ROLE_ADMIN) return [...employees];

  return employees.filter(emp => {
    const r = getEmployeeRoleType(emp);
    return r !== null && r === mgr;
  });
}
