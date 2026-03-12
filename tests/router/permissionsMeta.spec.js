import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PERMISSIONS, PERMISSION_DEFINITIONS } from '@/constants/permissions';

const mockAuthService = {
  isAuthenticated: vi.fn(() => true),
  getCurrentUser: vi.fn(() => ({ email: 'admin@rakez.com', type: 1 })),
  isSessionExpiring: vi.fn(() => false),
};

vi.mock('@/services/authService', () => ({
  default: mockAuthService,
}));

vi.mock('@/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/utils/rbac', () => ({
  canAccessRoute: vi.fn(() => true),
  getDashboardPathForUser: vi.fn(() => '/dashboard'),
  isSalesLeader: vi.fn(() => false),
}));

vi.mock('@/services/notificationService', () => ({
  default: { addNotification: vi.fn() },
}));

describe('router permission meta integrity', () => {
  let router;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    router = (await import('@/router/index.js')).default;
  });

  it('uses only known permission keys in route meta', () => {
    const knownPermissions = new Set(Object.values(PERMISSIONS));
    const definedPermissions = new Set(Object.keys(PERMISSION_DEFINITIONS));
    const routePermissions = router
      .getRoutes()
      .flatMap(route => {
        const perms = route.meta?.permissions;
        if (!perms) return [];
        return Array.isArray(perms) ? perms : [perms];
      })
      .filter(Boolean);

    expect(routePermissions.length).toBeGreaterThan(0);

    for (const permission of routePermissions) {
      expect(knownPermissions.has(permission)).toBe(true);
      expect(definedPermissions.has(permission)).toBe(true);
      expect(permission).not.toBe('sales.payment-plan.manage');
    }
  });

  it('keeps SalesPaymentPlans route aligned with payment_plan permission', () => {
    const route = router.getRoutes().find(record => record.name === 'SalesPaymentPlans');
    expect(route).toBeDefined();
    expect(Array.isArray(route.meta?.permissions)).toBe(true);
    expect(route.meta.permissions).toContain(PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE);
  });
});
