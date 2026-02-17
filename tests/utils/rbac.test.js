/**
 * RBAC Utils Tests
 */

import { describe, it, expect, vi } from 'vitest'
import {
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
} from '../../src/utils/rbac'

describe('rbac', () => {
  describe('normalizeRole', () => {
    it('should return number for string role in ROLE_MAP', () => {
      expect(normalizeRole('admin')).toBe(1)
      expect(normalizeRole('sales')).toBe(5)
      expect(normalizeRole('credit')).toBe(6)
    })

    it('should return number unchanged', () => {
      expect(normalizeRole(1)).toBe(1)
      expect(normalizeRole(5)).toBe(5)
    })

    it('should return null for unknown string or non-number', () => {
      expect(normalizeRole('unknown')).toBeNull()
      expect(normalizeRole(null)).toBeNull()
      expect(normalizeRole(undefined)).toBeNull()
    })
  })

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      expect(hasRole({ type: 1 }, 1)).toBe(true)
      expect(hasRole({ type: 'admin' }, 'admin')).toBe(true)
      expect(hasRole({ type: 5 }, [5, 6])).toBe(true)
    })

    it('should return false when user has no type', () => {
      expect(hasRole({}, 1)).toBe(false)
      expect(hasRole(null, 1)).toBe(false)
      expect(hasRole({ type: null }, 1)).toBe(false)
    })

    it('should return false when role does not match', () => {
      expect(hasRole({ type: 5 }, 6)).toBe(false)
      expect(hasRole({ type: 5 }, [6, 7])).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin type', () => {
      expect(isAdmin({ type: 1 })).toBe(true)
      expect(isAdmin({ type: 'admin' })).toBe(true)
    })

    it('should return false for non-admin', () => {
      expect(isAdmin({ type: 5 })).toBe(false)
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('isManager', () => {
    it('should return true for admin', () => {
      expect(isManager({ type: 1 })).toBe(true)
    })

    it('should return true for PM with is_manager', () => {
      expect(isManager({ type: 3, is_manager: true })).toBe(true)
    })

    it('should return false for PM without is_manager', () => {
      expect(isManager({ type: 3, is_manager: false })).toBe(false)
    })

    it('should return false for null user', () => {
      expect(isManager(null)).toBe(false)
    })
  })

  describe('getEffectiveRoleKey', () => {
    it('should return default for null user', () => {
      expect(getEffectiveRoleKey(null)).toBe('default')
    })

    it('should return sales_leader for sales with is_leader', () => {
      expect(getEffectiveRoleKey({ type: 5, is_leader: true })).toBe('sales_leader')
    })

    it('should return role key for normal role', () => {
      expect(getEffectiveRoleKey({ type: 1 })).toBe('admin')
      expect(getEffectiveRoleKey({ type: 6 })).toBe('credit')
    })
  })

  describe('getUserPermissions', () => {
    it('should return user.permissions when present', () => {
      const perms = ['contracts.view', 'contracts.edit']
      expect(getUserPermissions({ permissions: perms })).toEqual(perms)
    })

    it('should return [] for null user', () => {
      expect(getUserPermissions(null)).toEqual([])
    })

    it('should derive from bootstrap when user.permissions empty', () => {
      const result = getUserPermissions({ type: 1 })
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin regardless of permission', () => {
      expect(hasPermission({ type: 1 }, 'any.permission')).toBe(true)
    })

    it('should return true when user has permission', () => {
      expect(hasPermission({ permissions: ['contracts.view'] }, 'contracts.view')).toBe(true)
    })

    it('should return false when user lacks permission', () => {
      expect(hasPermission({ permissions: ['contracts.view'] }, 'contracts.delete')).toBe(false)
    })

    it('should return false for null user or permission', () => {
      expect(hasPermission(null, 'x')).toBe(false)
      expect(hasPermission({ type: 5 }, '')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true for admin', () => {
      expect(hasAnyPermission({ type: 1 }, ['a', 'b'])).toBe(true)
    })

    it('should return true when user has one of the permissions', () => {
      expect(hasAnyPermission({ permissions: ['a'] }, ['a', 'b'])).toBe(true)
      expect(hasAnyPermission({ permissions: ['a'] }, 'a')).toBe(true)
    })

    it('should return false when user has none', () => {
      expect(hasAnyPermission({ permissions: ['c'] }, ['a', 'b'])).toBe(false)
    })
  })

  describe('canAccessRoute', () => {
    it('should allow public routes without user', () => {
      expect(canAccessRoute(null, { public: true })).toBe(true)
    })

    it('should deny non-public when no user', () => {
      expect(canAccessRoute(null, { roles: [1] })).toBe(false)
    })

    it('should allow when no roles or permissions required', () => {
      expect(canAccessRoute({ type: 5 }, {})).toBe(true)
      expect(canAccessRoute({ type: 5 }, {})).toBe(true)
    })

    it('should check permissions when meta.permissions set', () => {
      expect(canAccessRoute({ permissions: ['contracts.view'] }, { permissions: 'contracts.view' })).toBe(true)
      expect(canAccessRoute({ type: 5, permissions: [] }, { permissions: ['contracts.delete'] })).toBe(false)
    })

    it('should check roles when meta.roles set', () => {
      expect(canAccessRoute({ type: 1 }, { roles: [1] })).toBe(true)
      expect(canAccessRoute({ type: 5 }, { roles: [1] })).toBe(false)
    })
  })

  describe('getDashboardPathForUser', () => {
    it('should return /dashboard for null user', () => {
      expect(getDashboardPathForUser(null)).toBe('/dashboard')
    })

    it('should return role-specific paths', () => {
      expect(getDashboardPathForUser({ type: 0 })).toBe('/marketing/dashboard')
      expect(getDashboardPathForUser({ type: 5 })).toBe('/sales/dashboard')
      expect(getDashboardPathForUser({ type: 6 })).toBe('/credit/dashboard')
      expect(getDashboardPathForUser({ type: 7 })).toBe('/accounting/dashboard')
      expect(getDashboardPathForUser({ type: 4 })).toBe('/editor/contracts')
      expect(getDashboardPathForUser({ type: 8 })).toBe('/hr/dashboard')
    })

    it('should return /dashboard for unknown role', () => {
      expect(getDashboardPathForUser({ type: 99 })).toBe('/dashboard')
    })
  })

  describe('getUserRoleLabel', () => {
    it('should return label for known role', () => {
      const label = getUserRoleLabel({ type: 1 })
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })

    it('should return غير محدد for null user or no type', () => {
      expect(getUserRoleLabel(null)).toBe('غير محدد')
      expect(getUserRoleLabel({})).toBe('غير محدد')
    })
  })

  describe('canPerformAction', () => {
    it('should return true for admin', () => {
      expect(canPerformAction({ type: 1 }, 'delete', 'contract')).toBe(true)
    })

    it('should return false for null user', () => {
      expect(canPerformAction(null, 'view', 'contract')).toBe(false)
    })

    it('should return true when role has action on resource', () => {
      expect(canPerformAction({ type: 5 }, 'view', 'reservation')).toBe(true)
    })

    it('should return false when role lacks action', () => {
      expect(canPerformAction({ type: 5 }, 'delete', 'contract')).toBe(false)
    })
  })
})
