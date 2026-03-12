/**
 * RBAC Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeRole,
  hasRole,
  isAdmin,
  isManager,
  isSalesLeader,
  getEffectiveRoleKey,
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  canAccessRoute,
  getDashboardPathForUser,
} from '../../src/utils/rbac';

describe('rbac', () => {
  describe('normalizeRole', () => {
    it('should return number for string role in ROLE_MAP (case-insensitive)', () => {
      expect(normalizeRole('admin')).toBe(1);
      expect(normalizeRole('Sales')).toBe(5);
      expect(normalizeRole('CREDIT')).toBe(6);
    });

    it('should parse numeric strings', () => {
      expect(normalizeRole('0')).toBe(0);
      expect(normalizeRole('7')).toBe(7);
      expect(normalizeRole(' 9 ')).toBe(9);
    });

    it('should return number unchanged', () => {
      expect(normalizeRole(1)).toBe(1);
      expect(normalizeRole(5)).toBe(5);
    });

    it('should return null for unknown string or non-number', () => {
      expect(normalizeRole('unknown')).toBeNull();
      expect(normalizeRole(null)).toBeNull();
      expect(normalizeRole(undefined)).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      expect(hasRole({ type: 1 }, 1)).toBe(true);
      expect(hasRole({ type: 'admin' }, 'admin')).toBe(true);
      expect(hasRole({ type: 5 }, [5, 6])).toBe(true);
      expect(hasRole({ type: 0 }, 0)).toBe(true);
      expect(hasRole({ type: '0' }, 0)).toBe(true);
    });

    it('should return false when user has no type', () => {
      expect(hasRole({}, 1)).toBe(false);
      expect(hasRole(null, 1)).toBe(false);
      expect(hasRole({ type: null }, 1)).toBe(false);
    });

    it('should return false when role does not match', () => {
      expect(hasRole({ type: 5 }, 6)).toBe(false);
      expect(hasRole({ type: 5 }, [6, 7])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin type', () => {
      expect(isAdmin({ type: 1 })).toBe(true);
      expect(isAdmin({ type: 'admin' })).toBe(true);
    });

    it('should return false for non-admin', () => {
      expect(isAdmin({ type: 5 })).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isManager', () => {
    it('should return true for admin', () => {
      expect(isManager({ type: 1 })).toBe(true);
    });

    it('should return true for PM with is_manager', () => {
      expect(isManager({ type: 3, is_manager: true })).toBe(true);
    });

    it('should return false for PM without is_manager', () => {
      expect(isManager({ type: 3, is_manager: false })).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isManager(null)).toBe(false);
    });
  });

  describe('getEffectiveRoleKey', () => {
    it('should return default for null user', () => {
      expect(getEffectiveRoleKey(null)).toBe('default');
    });

    it('should return sales_leader for sales with is_leader', () => {
      expect(getEffectiveRoleKey({ type: 5, is_leader: true })).toBe('sales_leader');
    });

    it('should return role key for normal role', () => {
      expect(getEffectiveRoleKey({ type: 1 })).toBe('admin');
      expect(getEffectiveRoleKey({ type: 6 })).toBe('credit');
    });
  });

  describe('isSalesLeader', () => {
    it('should return true for sales with is_manager=true', () => {
      expect(isSalesLeader({ type: 5, is_manager: true })).toBe(true);
    });

    it('should return true for sales with is_leader=true', () => {
      expect(isSalesLeader({ type: 5, is_leader: true })).toBe(true);
    });

    it('should return false for sales without manager/leader flag', () => {
      expect(isSalesLeader({ type: 5 })).toBe(false);
      expect(isSalesLeader({ type: 5, is_manager: false })).toBe(false);
    });

    it('should return false for non-sales with is_manager=true', () => {
      expect(isSalesLeader({ type: 3, is_manager: true })).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user.permissions when present (non-sales)', () => {
      const perms = ['contracts.view', 'contracts.edit'];
      expect(getUserPermissions({ type: 3, permissions: perms })).toEqual(perms);
    });

    it('should return [] for null user', () => {
      expect(getUserPermissions(null)).toEqual([]);
    });

    it('should derive from bootstrap when user.permissions empty', () => {
      const result = getUserPermissions({ type: 1 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should merge leader permissions for sales leader even when API returns permissions', () => {
      const apiPerms = ['sales.dashboard.view', 'notifications.view'];
      const user = { type: 5, is_manager: true, permissions: apiPerms };
      const result = getUserPermissions(user);
      expect(result).toContain('sales.team.manage');
      expect(result).toContain('sales.tasks.manage');
      expect(result).toContain('sales.negotiation.approve');
      expect(result).toContain('sales.dashboard.view');
      expect(result).toContain('notifications.view');
    });

    it('should NOT merge leader permissions for regular sales with API permissions', () => {
      const apiPerms = ['sales.dashboard.view'];
      const user = { type: 5, is_manager: false, permissions: apiPerms };
      const result = getUserPermissions(user);
      expect(result).toEqual(apiPerms);
      expect(result).not.toContain('sales.team.manage');
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin regardless of permission', () => {
      expect(hasPermission({ type: 1 }, 'any.permission')).toBe(true);
    });

    it('should return true when user has permission', () => {
      expect(hasPermission({ permissions: ['contracts.view'] }, 'contracts.view')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(hasPermission({ permissions: ['contracts.view'] }, 'contracts.delete')).toBe(false);
    });

    it('should return false for null user or permission', () => {
      expect(hasPermission(null, 'x')).toBe(false);
      expect(hasPermission({ type: 5 }, '')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true for admin', () => {
      expect(hasAnyPermission({ type: 1 }, ['a', 'b'])).toBe(true);
    });

    it('should return true when user has one of the permissions', () => {
      expect(hasAnyPermission({ permissions: ['a'] }, ['a', 'b'])).toBe(true);
      expect(hasAnyPermission({ permissions: ['a'] }, 'a')).toBe(true);
    });

    it('should return false when user has none', () => {
      expect(hasAnyPermission({ permissions: ['c'] }, ['a', 'b'])).toBe(false);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow public routes without user', () => {
      expect(canAccessRoute(null, { public: true })).toBe(true);
    });

    it('should deny non-public when no user', () => {
      expect(canAccessRoute(null, { roles: [1] })).toBe(false);
    });

    it('should allow when no roles or permissions required', () => {
      expect(canAccessRoute({ type: 5 }, {})).toBe(true);
    });

    it('should check permissions when meta.permissions set', () => {
      expect(
        canAccessRoute({ permissions: ['contracts.view'] }, { permissions: 'contracts.view' })
      ).toBe(true);
      expect(
        canAccessRoute({ type: 5, permissions: [] }, { permissions: ['contracts.delete'] })
      ).toBe(false);
    });

    it('should check roles when meta.roles set', () => {
      expect(canAccessRoute({ type: 1 }, { roles: [1] })).toBe(true);
      expect(canAccessRoute({ type: 5 }, { roles: [1] })).toBe(false);
    });
  });

  describe('getDashboardPathForUser', () => {
    it('should return /dashboard for null user', () => {
      expect(getDashboardPathForUser(null)).toBe('/dashboard');
    });

    it('should return role-specific paths', () => {
      expect(getDashboardPathForUser({ type: 0 })).toBe('/marketing/dashboard');
      expect(getDashboardPathForUser({ type: 5 })).toBe('/sales/dashboard');
      expect(getDashboardPathForUser({ type: 6 })).toBe('/credit/dashboard');
      expect(getDashboardPathForUser({ type: 7 })).toBe('/accounting/dashboard');
      expect(getDashboardPathForUser({ type: 4 })).toBe('/editor/dashboard');
      expect(getDashboardPathForUser({ type: 8 })).toBe('/hr/dashboard');
    });

    it('should return /dashboard for unknown role', () => {
      expect(getDashboardPathForUser({ type: 99 })).toBe('/dashboard');
    });
  });

});
