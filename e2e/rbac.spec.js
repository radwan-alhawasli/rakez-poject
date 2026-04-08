import { test, expect } from '@playwright/test';

/**
 * Seed an authenticated session with the given role type and permissions.
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 1,
    name: 'Test User',
    email: 'test@rakez.com',
    type: 1,
    permissions: [],
    is_leader: false,
    is_manager: false,
    ...userOverrides,
  };

  await page.addInitScript(({ user, now, thirtyMin }) => {
    const tokenPayload = JSON.stringify({
      value: 'fake-jwt-token',
      expiration: now + thirtyMin,
      timestamp: now,
    });
    localStorage.setItem('authToken', tokenPayload);
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('sessionTimeout', String(now + thirtyMin));
    localStorage.setItem('lastActivity', String(now));
  }, { user: defaultUser, now, thirtyMin });
}

/* ------------------------------------------------------------------ */
/*  Admin access                                                       */
/* ------------------------------------------------------------------ */
test.describe('RBAC – Admin access', () => {
  test('admin can access /users', async ({ page }) => {
    await seedAuth(page, {
      type: 1, // ROLE_ADMIN
      name: 'Admin User',
      email: 'admin@rakez.com',
      permissions: ['hr.users.create'],
    });
    await page.goto('/users');
    await page.waitForURL(/users/);
    await expect(page).toHaveURL(/users/);
  });

  test('admin can access /accounting/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 1,
      name: 'Admin User',
      email: 'admin@rakez.com',
      permissions: ['accounting.dashboard.view'],
    });
    await page.goto('/accounting/dashboard');
    await page.waitForURL(/accounting/);
    await expect(page).toHaveURL(/accounting/);
  });

  test('admin can access /marketing/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 1,
      name: 'Admin User',
      email: 'admin@rakez.com',
      permissions: ['marketing.dashboard.view'],
    });
    await page.goto('/marketing/dashboard');
    await page.waitForURL(/marketing/);
    await expect(page).toHaveURL(/marketing/);
  });
});

/* ------------------------------------------------------------------ */
/*  Non-admin denied from admin-only routes                            */
/* ------------------------------------------------------------------ */
test.describe('RBAC – Non-admin denied from /users', () => {
  test('sales user is redirected away from /users', async ({ page }) => {
    await seedAuth(page, {
      type: 6, // ROLE_SALES
      name: 'Sales Agent',
      email: 'sales@rakez.com',
      permissions: [
        'sales.dashboard.view',
        'sales.reservations.view',
      ],
    });
    await page.goto('/users');
    // Should be redirected to the sales dashboard (role-based fallback)
    await page.waitForURL(/sales\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/users');
  });

  test('marketing user is redirected away from /users', async ({ page }) => {
    await seedAuth(page, {
      type: 5, // ROLE_MARKETING
      name: 'Marketing User',
      email: 'marketing@rakez.com',
      permissions: [
        'marketing.dashboard.view',
        'marketing.projects.view',
      ],
    });
    await page.goto('/users');
    await page.waitForURL(/marketing\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/users');
  });
});

/* ------------------------------------------------------------------ */
/*  Sales user access                                                  */
/* ------------------------------------------------------------------ */
test.describe('RBAC – Sales user access', () => {
  test('sales user can access /sales/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 6,
      name: 'Sales Agent',
      email: 'sales@rakez.com',
      permissions: [
        'sales.dashboard.view',
        'sales.projects.view',
        'sales.reservations.view',
      ],
    });
    await page.goto('/sales/dashboard');
    await page.waitForURL(/sales\/dashboard/);
    await expect(page).toHaveURL(/sales\/dashboard/);
  });

  test('sales user cannot access /accounting/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 6,
      name: 'Sales Agent',
      email: 'sales@rakez.com',
      permissions: [
        'sales.dashboard.view',
        'sales.reservations.view',
      ],
    });
    await page.goto('/accounting/dashboard');
    // Should be redirected away from accounting
    await page.waitForURL(/sales\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/accounting');
  });

  test('sales user cannot access /hr/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 6,
      name: 'Sales Agent',
      email: 'sales@rakez.com',
      permissions: [
        'sales.dashboard.view',
      ],
    });
    await page.goto('/hr/dashboard');
    await page.waitForURL(/sales\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/hr');
  });
});

/* ------------------------------------------------------------------ */
/*  Marketing user access                                              */
/* ------------------------------------------------------------------ */
test.describe('RBAC – Marketing user access', () => {
  test('marketing user can access /marketing/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 5, // ROLE_MARKETING
      name: 'Marketing Employee',
      email: 'marketing@rakez.com',
      permissions: [
        'marketing.dashboard.view',
        'marketing.projects.view',
        'marketing.tasks.view',
        'marketing.reports.view',
      ],
    });
    await page.goto('/marketing/dashboard');
    await page.waitForURL(/marketing\/dashboard/);
    await expect(page).toHaveURL(/marketing\/dashboard/);
  });

  test('marketing user cannot access /sales/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 5,
      name: 'Marketing Employee',
      email: 'marketing@rakez.com',
      permissions: [
        'marketing.dashboard.view',
      ],
    });
    await page.goto('/sales/dashboard');
    await page.waitForURL(/marketing\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/sales');
  });

  test('marketing user cannot access /accounting/sold-units', async ({ page }) => {
    await seedAuth(page, {
      type: 5,
      name: 'Marketing Employee',
      email: 'marketing@rakez.com',
      permissions: [
        'marketing.dashboard.view',
      ],
    });
    await page.goto('/accounting/sold-units');
    await page.waitForURL(/marketing\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/accounting');
  });
});

/* ------------------------------------------------------------------ */
/*  Accounting user access                                             */
/* ------------------------------------------------------------------ */
test.describe('RBAC – Accounting user access', () => {
  test('accounting user can access /accounting/dashboard', async ({ page }) => {
    await seedAuth(page, {
      type: 10, // ROLE_ACCOUNTING
      name: 'Accountant',
      email: 'accounting@rakez.com',
      permissions: [
        'accounting.dashboard.view',
        'accounting.sold-units.view',
      ],
    });
    await page.goto('/accounting/dashboard');
    await page.waitForURL(/accounting\/dashboard/);
    await expect(page).toHaveURL(/accounting\/dashboard/);
  });

  test('accounting user cannot access /project-management', async ({ page }) => {
    await seedAuth(page, {
      type: 10,
      name: 'Accountant',
      email: 'accounting@rakez.com',
      permissions: [
        'accounting.dashboard.view',
      ],
    });
    await page.goto('/project-management');
    await page.waitForURL(/accounting\/dashboard|dashboard/);
    expect(page.url()).not.toContain('/project-management');
  });
});
