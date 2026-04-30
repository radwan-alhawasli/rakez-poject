/**
 * Role-Based Access Control (RBAC): route access, permissions, and role checks.
 * Use constants from constants/roles and constants/permissions instead of magic numbers/strings.
 *
 * @module utils/rbac
 * @typedef {Object} User - User object from auth
 * @property {number|string} type - Role type
 * @property {string[]} [permissions]
 * @property {boolean|number|string} [is_leader]
 * @property {boolean|number|string} [is_manager]
 * @property {string} [email]
 * @typedef {Object} RouteMeta
 * @property {boolean} [public]
 * @property {number|string|Array<number|string>} [roles]
 * @property {string|string[]} [permissions]
 * @property {boolean} [requiresManager]
 */

import {
  ROLE_MAP,
  ROLE_ADMIN,
  ROLE_PROJECT_MANAGEMENT,
  ROLE_EDITOR,
  ROLE_DEVELOPER,
  ROLE_SALES,
  ROLE_SALES_LEADER,
  ROLE_CREDIT,
  ROLE_ACCOUNTING,
  ROLE_ACCOUNTANT,
  ROLE_HR,
  ROLE_MARKETING,
  ROLE_INVENTORY,
} from '@/constants/roles';
import {
  BOOTSTRAP_ROLE_MAP,
  ROLE_TO_BOOTSTRAP_KEY,
  SALES_BASE_PERMISSIONS,
  SALES_LEADER_EXTRA_PERMISSIONS,
} from '@/constants/permissions';

/** @param {any} value */
const isTruthyLeaderFlag = value => value === true || value === 1 || value === '1';

/** قائد المبيعات: إما دور 7 (sales_leader) أو دور 6 (sales) مع is_leader فقط.
 * @param {User} user
*/
export function isSalesLeader(user) {
  if (!user) return false;
  const role = normalizeRole(user.type);
  if (role === ROLE_SALES_LEADER) return true;
  return role === ROLE_SALES && (isTruthyLeaderFlag(user.is_leader) || isTruthyLeaderFlag(user.is_manager));
}

/**
 * Sales Manager: role sales + is_manager=true + not executive director.
 * @param {User} user
 * @returns {boolean}
 */
export function isSalesManager(user) {
  if (!user) return false;
  const role = normalizeRole(user.type);
  if (role !== ROLE_SALES) return false;
  const isMgr = isTruthyLeaderFlag(user.is_manager);
  const isExec = isTruthyLeaderFlag(/** @type {any} */ (user).is_executive_director);
  return isMgr && !isExec;
}

/**
 * Sales Executive: role sales + is_executive_director=true + not manager.
 * @param {User} user
 * @returns {boolean}
 */
export function isSalesExecutive(user) {
  if (!user) return false;
  const role = normalizeRole(user.type);
  if (role !== ROLE_SALES) return false;
  const isMgr = isTruthyLeaderFlag(user.is_manager);
  const isExec = isTruthyLeaderFlag(/** @type {any} */ (user).is_executive_director);
  return isExec && !isMgr;
}

/**
 * Normalize role type to numeric value
 * @param {string|number} roleType - Role type (string or number)
 * @returns {number|null} Normalized role type
 */
export function normalizeRole(roleType) {
  if (roleType === null || roleType === undefined) return null;

  if (typeof roleType === 'number' && Number.isFinite(roleType)) {
    return roleType;
  }

  if (typeof roleType === 'string') {
    const trimmed = roleType.trim();
    if (!trimmed) return null;

    // Support role keys from backend (case-insensitive)
    const key = trimmed.toLowerCase();
    /** @type {Record<string, number>} */
    const roleMap = ROLE_MAP;
    if (roleMap[key] !== undefined) {
      return roleMap[key];
    }

    // Support numeric strings (e.g. "7")
    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }
  }

  return null;
}

/**
 * Check if user has a specific role
 * @param {User} user - User object with type property
 * @param {string|number|Array<string|number>} allowedRoles - Role(s) to check against
 * @returns {boolean} True if user has the role
 */
export function hasRole(user, allowedRoles) {
  if (!user || user.type === undefined || user.type === null) return false;

  const userRole = normalizeRole(user.type);
  if (userRole === null) return false;

  // If allowedRoles is an array, check if user role is in the array
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.some(role => normalizeRole(role) === userRole);
  }

  // Single role check
  return normalizeRole(allowedRoles) === userRole;
}

/**
 * Check if user is admin
 * @param {User} user - User object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
  return hasRole(user, ROLE_ADMIN) || hasRole(user, 'admin');
}

/**
 * Check if user is manager (admin or PM manager)
 * @param {User} user - User object
 * @returns {boolean} True if user is manager
 */
export function isManager(user) {
  if (!user) return false;
  return isAdmin(user) || (hasRole(user, ROLE_PROJECT_MANAGEMENT) && isTruthyLeaderFlag(user.is_manager));
}

/**
 * @param {User} user
 * @returns {string}
 */
export function getEffectiveRoleKey(user) {
  if (!user) return 'default';
  const userRole = normalizeRole(user.type);
  if (userRole === ROLE_SALES_LEADER || (userRole === ROLE_SALES && isSalesLeader(user))) return 'sales_leader';
  // type 5 = marketing (حسب constants/roles.js) — لا حاجة لتوافق عكسي
  /** @type {Record<number, string>} */
  const roleToKey = ROLE_TO_BOOTSTRAP_KEY;
  return (userRole !== null ? roleToKey[userRole] : null) || 'default';
}

/**
 * Get user's permissions (from API or derived from role via bootstrap map)
 * @param {User} user - User object
 * @returns {string[]} Array of permission keys
 */
export function getUserPermissions(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    // Sales leader: merge API permissions with full leader set so sidebar/routes always work
    if (isSalesLeader(user)) {
      const leaderPerms = [...SALES_BASE_PERMISSIONS, ...SALES_LEADER_EXTRA_PERMISSIONS];
      return [...new Set([...user.permissions, ...leaderPerms])];
    }
    // مبيعات / قائد مبيعات (نوع الدور): دمج مع الحزمة الأساسية حتى لا تُحذف صلاحيات مثل sales.targets.update
    // عندما يعيد الخادم قائمة permissions ناقصة عن الواقع المطلوب للواجهة
    const role = normalizeRole(user.type);
    if (role === ROLE_SALES) {
      return [...new Set([...user.permissions, ...SALES_BASE_PERMISSIONS])];
    }
    if (role === ROLE_SALES_LEADER) {
      return [...new Set([...user.permissions, ...SALES_BASE_PERMISSIONS, ...SALES_LEADER_EXTRA_PERMISSIONS])];
    }
    return user.permissions;
  }
  const bootstrapKey = getEffectiveRoleKey(user);
  /** @type {Record<string, string[]>} */
  const bootstrapMap = BOOTSTRAP_ROLE_MAP;
  const perms = bootstrapMap[bootstrapKey] || bootstrapMap.default || [];
  return Array.isArray(perms) ? perms : [];
}

if (!import.meta.env.PROD) {
  const definedSales = new Set(BOOTSTRAP_ROLE_MAP.sales || []);
  const definedSalesLeader = new Set(BOOTSTRAP_ROLE_MAP.sales_leader || []);
  const expectedSales = new Set(SALES_BASE_PERMISSIONS);
  const expectedSalesLeader = new Set([
    ...SALES_BASE_PERMISSIONS,
    ...SALES_LEADER_EXTRA_PERMISSIONS,
  ]);

  const salesMismatch = [...expectedSales].some(p => !definedSales.has(p));
  const leaderMismatch = [...expectedSalesLeader].some(p => !definedSalesLeader.has(p));
  if ((salesMismatch || leaderMismatch) && !import.meta.env.PROD) {
    // Dev-only drift warning against backend snippet baseline for sales roles
    console.warn(
      '[RBAC] Sales bootstrap permission map drift detected. Review src/constants/permissions.js'
    );
  }
}

/**
 * Check if user has a specific permission
 * @param {User} user - User object
 * @param {string} permission - Permission key (e.g. 'contracts.view')
 * @returns {boolean} True if user has the permission
 */
export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  if (isAdmin(user)) return true;
  const perms = getUserPermissions(user);
  return perms.includes(permission);
}

/**
 * Check if user has any of the given permissions
 * @param {User} user - User object
 * @param {string|string[]} permissions - Permission key or array of keys
 * @returns {boolean} True if user has at least one permission
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !permissions) return false;
  if (isAdmin(user)) return true;
  const allowed = Array.isArray(permissions) ? permissions : [permissions];
  const userPerms = getUserPermissions(user);
  return allowed.some(p => userPerms.includes(p));
}

/**
 * Check if user can access a route based on required roles or permissions
 * @param {User} user - User object
 * @param {RouteMeta} routeMeta - Route meta object with roles/permissions
 * @returns {boolean} True if user can access the route
 */
export function canAccessRoute(user, routeMeta) {
  // Public routes are accessible to everyone
  if (routeMeta?.public) return true;

  // If no user, deny access
  if (!user) return false;

  // If requiresManager is set, user must have is_manager flag — الإدمن يتجاوز هذا القيد
  if (routeMeta?.requiresManager) {
    if (isAdmin(user)) return true;
    return isTruthyLeaderFlag(user.is_manager);
  }

  // If no roles or permissions specified, allow authenticated users
  if (!routeMeta?.roles && !routeMeta?.permissions) return true;

  // Check permission-based access first (if meta.permissions is set)
  if (routeMeta.permissions) {
    const requiredPermissions = Array.isArray(routeMeta.permissions)
      ? routeMeta.permissions
      : [routeMeta.permissions];
    return hasAnyPermission(user, requiredPermissions);
  }

  // Check role-based access
  if (routeMeta.roles) {
    return hasRole(user, routeMeta.roles);
  }

  return false;
}

/**
 * Get the dashboard path for a user based on their role (single source of truth for login and router redirects)
 * @param {User} user - User object with type property
 * @returns {string} Path to role-specific dashboard
 */
export function getDashboardPathForUser(user) {
  if (!user) return '/dashboard';
  const normalizedRole = normalizeRole(user.type);
  if (normalizedRole === ROLE_HR) return '/hr/dashboard';
  if (normalizedRole === ROLE_MARKETING) return '/marketing/dashboard';
  if (normalizedRole === ROLE_SALES || normalizedRole === ROLE_SALES_LEADER) return '/sales/dashboard';
  if (normalizedRole === ROLE_CREDIT) return '/credit/dashboard';
  if (normalizedRole === ROLE_ACCOUNTING) return '/accounting/dashboard';
  if (normalizedRole === ROLE_EDITOR) return '/editor/dashboard';
  if (normalizedRole === ROLE_DEVELOPER) return '/dashboard';
  if (normalizedRole === ROLE_PROJECT_MANAGEMENT) return '/project-management/dashboard';
  if (normalizedRole === ROLE_INVENTORY) return '/inventory/dashboard';
  if (normalizedRole === ROLE_ACCOUNTANT) return '/accounting/dashboard';
  return '/dashboard';
}
