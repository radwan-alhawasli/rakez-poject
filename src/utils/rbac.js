/**
 * Role-Based Access Control (RBAC) Utility
 * Centralized permission checking and route protection
 */

import { ROLE_MAP, ROLES } from '../constants/roles'
import { BOOTSTRAP_ROLE_MAP, ROLE_TO_BOOTSTRAP_KEY } from '../constants/permissions'

const SALES_BASE_PERMISSIONS = [
    'sales.dashboard.view',
    'sales.projects.view',
    'sales.units.view',
    'sales.units.book',
    'sales.reservations.create',
    'sales.reservations.view',
    'sales.reservations.confirm',
    'sales.reservations.cancel',
    'sales.waiting_list.create',
    'sales.goals.view',
    'sales.schedule.view',
    'sales.targets.view',
    'sales.targets.update',
    'sales.attendance.view',
    'notifications.view',
    'exclusive_projects.request',
    'exclusive_projects.contract.complete',
    'exclusive_projects.contract.export',
    'use-ai-assistant'
]

const SALES_LEADER_EXTRA_PERMISSIONS = [
    'sales.waiting_list.convert',
    'sales.goals.create',
    'sales.team.manage',
    'sales.attendance.manage',
    'sales.tasks.manage',
    'sales.tasks.create_for_marketing',
    'sales.projects.allocate_shifts',
    'sales.negotiation.approve',
    'sales.payment-plan.manage'
]

const isTruthyLeaderFlag = (value) => value === true || value === 1 || value === '1'

/**
 * Normalize role type to numeric value
 * @param {string|number} roleType - Role type (string or number)
 * @returns {number} Normalized role type
 */
export function normalizeRole(roleType) {
    if (typeof roleType === 'string' && ROLE_MAP[roleType] !== undefined) {
        return ROLE_MAP[roleType]
    }
    return typeof roleType === 'number' ? roleType : null
}

/**
 * Check if user has a specific role
 * @param {Object} user - User object with type property
 * @param {string|number|Array} allowedRoles - Role(s) to check against
 * @returns {boolean} True if user has the role
 */
export function hasRole(user, allowedRoles) {
    if (!user || !user.type) return false

    const userRole = normalizeRole(user.type)
    if (userRole === null) return false

    // If allowedRoles is an array, check if user role is in the array
    if (Array.isArray(allowedRoles)) {
        return allowedRoles.some(role => normalizeRole(role) === userRole)
    }

    // Single role check
    return normalizeRole(allowedRoles) === userRole
}

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
    return hasRole(user, 1) || hasRole(user, 'admin')
}

/**
 * Check if user is manager (admin or PM manager)
 * @param {Object} user - User object
 * @returns {boolean} True if user is manager
 */
export function isManager(user) {
    if (!user) return false
    return isAdmin(user) || (hasRole(user, 3) && user.is_manager === true)
}

export function getEffectiveRoleKey(user) {
    if (!user) return 'default'
    const userRole = normalizeRole(user.type)
    if (userRole === 5 && isTruthyLeaderFlag(user.is_leader)) return 'sales_leader'
    return ROLE_TO_BOOTSTRAP_KEY[userRole] || 'default'
}

/**
 * Get user's permissions (from API or derived from role via bootstrap map)
 * @param {Object} user - User object
 * @returns {string[]} Array of permission keys
 */
export function getUserPermissions(user) {
    if (!user) return []
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
        return user.permissions
    }
    const bootstrapKey = getEffectiveRoleKey(user)
    const perms = BOOTSTRAP_ROLE_MAP[bootstrapKey] || BOOTSTRAP_ROLE_MAP.default || []
    return Array.isArray(perms) ? perms : []
}

if (process.env.NODE_ENV !== 'production') {
    const definedSales = new Set(BOOTSTRAP_ROLE_MAP.sales || [])
    const definedSalesLeader = new Set(BOOTSTRAP_ROLE_MAP.sales_leader || [])
    const expectedSales = new Set(SALES_BASE_PERMISSIONS)
    const expectedSalesLeader = new Set([...SALES_BASE_PERMISSIONS, ...SALES_LEADER_EXTRA_PERMISSIONS])

    const salesMismatch = [...expectedSales].some(p => !definedSales.has(p))
    const leaderMismatch = [...expectedSalesLeader].some(p => !definedSalesLeader.has(p))
    if (salesMismatch || leaderMismatch) {
        // Dev-only drift warning against backend snippet baseline for sales roles
        // eslint-disable-next-line no-console
        console.warn('[RBAC] Sales bootstrap permission map drift detected. Review src/constants/permissions.js')
    }
}

/**
 * Check if user has a specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission key (e.g. 'contracts.view')
 * @returns {boolean} True if user has the permission
 */
export function hasPermission(user, permission) {
    if (!user || !permission) return false
    if (isAdmin(user)) return true
    const perms = getUserPermissions(user)
    return perms.includes(permission)
}

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object
 * @param {string|string[]} permissions - Permission key or array of keys
 * @returns {boolean} True if user has at least one permission
 */
export function hasAnyPermission(user, permissions) {
    if (!user || !permissions) return false
    if (isAdmin(user)) return true
    const allowed = Array.isArray(permissions) ? permissions : [permissions]
    const userPerms = getUserPermissions(user)
    return allowed.some(p => userPerms.includes(p))
}

/**
 * Check if user can access a route based on required roles or permissions
 * @param {Object} user - User object
 * @param {Object} routeMeta - Route meta object with roles/permissions
 * @returns {boolean} True if user can access the route
 */
export function canAccessRoute(user, routeMeta) {
    // Public routes are accessible to everyone
    if (routeMeta?.public) return true

    // If no user, deny access
    if (!user) return false

    // If no roles or permissions specified, allow authenticated users
    if (!routeMeta?.roles && !routeMeta?.permissions) return true

    // Check permission-based access first (if meta.permissions is set)
    if (routeMeta.permissions) {
        const requiredPermissions = Array.isArray(routeMeta.permissions)
            ? routeMeta.permissions
            : [routeMeta.permissions]
        return hasAnyPermission(user, requiredPermissions)
    }

    // Check role-based access
    if (routeMeta.roles) {
        return hasRole(user, routeMeta.roles)
    }

    return false
}

/**
 * Get the dashboard path for a user based on their role (single source of truth for login and router redirects)
 * @param {Object} user - User object with type property
 * @returns {string} Path to role-specific dashboard
 */
export function getDashboardPathForUser(user) {
    if (!user) return '/dashboard'
    const normalizedRole = normalizeRole(user.type)
    if (normalizedRole === 8 || normalizedRole === 9) return '/hr/dashboard'
    if (normalizedRole === 0) return '/marketing/dashboard'
    if (normalizedRole === 5) return '/sales/dashboard'
    if (normalizedRole === 6) return '/credit/dashboard'
    if (normalizedRole === 7) return '/accounting/dashboard'
    if (normalizedRole === 4) return '/editor/contracts'
    return '/dashboard'
}

/**
 * Get user's role label
 * @param {Object} user - User object
 * @returns {string} Role label
 */
export function getUserRoleLabel(user) {
    if (!user || !user.type) return 'غير محدد'
    const normalizedType = normalizeRole(user.type)
    return ROLES[normalizedType]?.label || 'غير محدد'
}

/**
 * Check if user can perform an action
 * @param {Object} user - User object
 * @param {string} action - Action to check (e.g., 'create', 'edit', 'delete')
 * @param {string} resource - Resource type (e.g., 'contract', 'user')
 * @returns {boolean} True if user can perform the action
 */
export function canPerformAction(user, action, resource) {
    if (!user) return false

    // Admins can do everything
    if (isAdmin(user)) return true

    // Define action permissions by role
    const permissions = {
        // Marketing role permissions
        0: {
            contract: ['view', 'create'],
            project: ['view', 'edit'],
            lead: ['create', 'edit', 'view']
        },
        // Admin - all permissions (handled above)
        1: {},
        // Project Acquisition
        2: {
            contract: ['view', 'create', 'edit'],
            project: ['view']
        },
        // Project Management
        3: {
            contract: ['view', 'edit'],
            project: ['view', 'edit', 'approve'],
            unit: ['view', 'edit']
        },
        // Editor
        4: {
            contract: ['view', 'edit'],
            project: ['view']
        },
        // Sales
        5: {
            contract: ['view'],
            reservation: ['create', 'view', 'edit'],
            target: ['view', 'edit']
        },
        // Credit
        6: {
            contract: ['view'],
            credit: ['view', 'approve']
        },
        // Accounting
        7: {
            contract: ['view'],
            payment: ['view', 'edit']
        },
        // HR
        8: {
            user: ['view', 'create', 'edit', 'delete'],
            team: ['view', 'create', 'edit'],
            report: ['view']
        }
    }

    const rolePermissions = permissions[normalizeRole(user.type)] || {}
    const resourcePermissions = rolePermissions[resource] || []

    return resourcePermissions.includes(action)
}

export default {
    normalizeRole,
    hasRole,
    isAdmin,
    isManager,
    getEffectiveRoleKey,
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    canAccessRoute,
    getDashboardPathForUser,
    getUserRoleLabel,
    canPerformAction
}
