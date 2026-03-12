import { describe, it, expect } from 'vitest';
import {
  PERMISSIONS,
  PERMISSION_DEFINITIONS,
  SALES_BASE_PERMISSIONS,
  SALES_LEADER_EXTRA_PERMISSIONS,
  BOOTSTRAP_ROLE_MAP,
  ROLE_TO_BOOTSTRAP_KEY,
} from '../../src/constants/permissions';

describe('permissions consistency', () => {
  it('maps frontend permission constants to known definitions', () => {
    const definedPermissions = new Set(Object.keys(PERMISSION_DEFINITIONS));
    const constantValues = Object.values(PERMISSIONS);

    for (const permission of constantValues) {
      expect(definedPermissions.has(permission)).toBe(true);
    }
  });

  it('keeps sales payment plan permission aligned with backend key format', () => {
    expect(PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE).toBe('sales.payment_plan.manage');
    expect(PERMISSION_DEFINITIONS['sales.payment_plan.manage']).toBeDefined();
    expect(PERMISSION_DEFINITIONS['sales.payment-plan.manage']).toBeUndefined();
    expect(SALES_LEADER_EXTRA_PERMISSIONS).toContain('sales.payment_plan.manage');
    expect(SALES_LEADER_EXTRA_PERMISSIONS).not.toContain('sales.payment-plan.manage');
  });

  it('keeps sales role maps and arrays in sync for key capabilities', () => {
    expect(SALES_BASE_PERMISSIONS).toContain('sales.dashboard.view');
    expect(SALES_LEADER_EXTRA_PERMISSIONS).toContain('sales.team.manage');
    expect(BOOTSTRAP_ROLE_MAP.sales).toEqual(SALES_BASE_PERMISSIONS);
    expect(BOOTSTRAP_ROLE_MAP.sales_leader).toContain('sales.payment_plan.manage');
    expect(BOOTSTRAP_ROLE_MAP.sales_leader).toContain('sales.tasks.manage');
  });

  it('ensures all bootstrap map permissions are defined', () => {
    const definedPermissions = new Set(Object.keys(PERMISSION_DEFINITIONS));

    for (const [roleKey, permissions] of Object.entries(BOOTSTRAP_ROLE_MAP)) {
      for (const permission of permissions) {
        expect(definedPermissions.has(permission)).toBe(true);
      }
      const uniqueCount = new Set(permissions).size;
      expect(uniqueCount).toBe(permissions.length);
      expect(roleKey.length).toBeGreaterThan(0);
    }
  });

  it('ensures role-to-bootstrap map references valid role keys', () => {
    const roleKeys = new Set(Object.keys(BOOTSTRAP_ROLE_MAP));
    for (const bootstrapKey of Object.values(ROLE_TO_BOOTSTRAP_KEY)) {
      expect(roleKeys.has(bootstrapKey)).toBe(true);
    }
  });
});
