/**
 * Role-Based Access Control (RBAC): route access, permissions, and role checks.
 * Use constants from constants/roles and constants/permissions instead of magic numbers/strings.
 *
 * @module utils/rbac
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

export interface User {
  type: number | string;
  permissions?: string[];
  is_leader?: boolean | number | string;
  is_manager?: boolean | number | string;
  email?: string;
  [key: string]: any;
}

export interface RouteMeta {
  public?: boolean;
  roles?: number | string | Array<number | string>;
  permissions?: string | string[];
  requiresManager?: boolean;
  [key: string]: any;
}

const isTruthyLeaderFlag = (value: any): boolean => value === true || value === 1 || value === '1';

/** قائد المبيعات: إما دور 7 (sales_leader) أو دور 6 (sales) مع is_manager/is_leader — نفس واجهة المبيعات. */
export function isSalesLeader(user?: User | null): boolean {
  if (!user) return false;
  const role = normalizeRole(user.type);
  if (role === ROLE_SALES_LEADER) return true;
  if (role === ROLE_SALES) return isTruthyLeaderFlag(user.is_leader) || isTruthyLeaderFlag(user.is_manager);
  return false;
}

/**
 * Normalize role type to numeric value
 * @param roleType - Role type (string or number)
 * @returns Normalized role type or null
 */
export function normalizeRole(roleType?: string | number | null): number | null {
  if (roleType === null || roleType === undefined) return null;

  if (typeof roleType === 'number' && Number.isFinite(roleType)) {
    return roleType;
  }

  if (typeof roleType === 'string') {
    const trimmed = roleType.trim();
    if (!trimmed) return null;

    // Support role keys from backend (case-insensitive)
    const key = trimmed.toLowerCase();
    if (ROLE_MAP[key] !== undefined) {
      return ROLE_MAP[key];
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
 * @param user - User object with type property
 * @param allowedRoles - Role(s) to check against
 * @returns True if user has the role
 */
export function hasRole(user: User | null | undefined, allowedRoles: string | number | Array<string | number>): boolean {
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
 * @param user - User object
 * @returns True if user is admin
 */
export function isAdmin(user?: User | null): boolean {
  return hasRole(user, ROLE_ADMIN) || hasRole(user, 'admin');
}

/**
 * Check if user is manager (admin or PM manager)
 * @param user - User object
 * @returns True if user is manager
 */
export function isManager(user?: User | null): boolean {
  if (!user) return false;
  return isAdmin(user) || (hasRole(user, ROLE_PROJECT_MANAGEMENT) && user.is_manager === true);
}

export function getEffectiveRoleKey(user?: User | null): string {
  if (!user) return 'default';
  const userRole = normalizeRole(user.type);
  if (userRole === ROLE_SALES_LEADER || (userRole === ROLE_SALES && isSalesLeader(user))) return 'sales_leader';
  // type 5 = marketing (حسب constants/roles.js) — لا حاجة لتوافق عكسي
  return ROLE_TO_BOOTSTRAP_KEY[userRole as keyof typeof ROLE_TO_BOOTSTRAP_KEY] || 'default';
}

/**
 * Get user's permissions (from API or derived from role via bootstrap map)
 * @param user - User object
 * @returns Array of permission keys
 */
export function getUserPermissions(user?: User | null): string[] {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    // Sales leader: merge API permissions with full leader set so sidebar/routes always work
    if (isSalesLeader(user)) {
      const leaderPerms = [...SALES_BASE_PERMISSIONS, ...SALES_LEADER_EXTRA_PERMISSIONS];
      return [...new Set([...user.permissions, ...leaderPerms])];
    }
    return user.permissions;
  }
  const bootstrapKey = getEffectiveRoleKey(user);
  const perms = BOOTSTRAP_ROLE_MAP[bootstrapKey as keyof typeof BOOTSTRAP_ROLE_MAP] || BOOTSTRAP_ROLE_MAP.default || [];
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
 * @param user - User object
 * @param permission - Permission key (e.g. 'contracts.view')
 * @returns True if user has the permission
 */
export function hasPermission(user: User | null | undefined, permission: string): boolean {
  if (!user || !permission) return false;
  if (isAdmin(user)) return true;
  const perms = getUserPermissions(user);
  return perms.includes(permission);
}

/**
 * Check if user has any of the given permissions
 * @param user - User object
 * @param permissions - Permission key or array of keys
 * @returns True if user has at least one permission
 */
export function hasAnyPermission(user: User | null | undefined, permissions: string | string[]): boolean {
  if (!user || !permissions) return false;
  if (isAdmin(user)) return true;
  const allowed = Array.isArray(permissions) ? permissions : [permissions];
  const userPerms = getUserPermissions(user);
  return allowed.some(p => userPerms.includes(p));
}

/**
 * Check if user can access a route based on required roles or permissions
 * @param user - User object
 * @param routeMeta - Route meta object with roles/permissions
 * @returns True if user can access the route
 */
export function canAccessRoute(user: User | null | undefined, routeMeta?: RouteMeta): boolean {
  // Public routes are accessible to everyone
  if (routeMeta?.public) return true;

  // If no user, deny access
  if (!user) return false;

  // If requiresManager is set, user must have is_manager flag (any role)
  if (routeMeta?.requiresManager) {
    return user.is_manager === true || user.is_manager === 1 || user.is_manager === '1';
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
 * @param user - User object with type property
 * @returns Path to role-specific dashboard
 */
export function getDashboardPathForUser(user?: User | null): string {
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
