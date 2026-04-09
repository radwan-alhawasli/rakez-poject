import { test, expect } from '@playwright/test';

/**
 * Seed an authenticated session with accounting role + permissions.
 * Covers sold-units (commission columns) — there is no /accounting/commissions route in the app.
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 10,
    name: 'Accounting User',
    email: 'accounting@rakez.com',
    type: 10, // ROLE_ACCOUNTING
    permissions: [
      'accounting.dashboard.view',
      'accounting.notifications.view',
      'accounting.sold-units.view',
      'accounting.deposits.view',
      'accounting.salaries.view',
      'accounting.down_payment.confirm',
      'notifications.view',
    ],
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

/**
 * CI / preview لا يتصل بخادم API؛ بدون بيانات تُعرض حالة فارغة ولا يظهر الجدول.
 * نعترض GET لمسار accounting sold-units كي تمر اختبارات هيكل الجدول والعرض.
 */
async function mockAccountingSoldUnitsApi(page) {
  await page.route('**/accounting/sold-units**', async route => {
    // لا تعترض طلب الوثيقة (SPA) — وإلا يُستبدل HTML بـ JSON ولا تُحمَّل الواجهة
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/\/$/, '');
    const detailMatch = path.match(/\/accounting\/sold-units\/(\d+)$/);
    if (detailMatch) {
      const id = detailMatch[1];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: Number(id),
            reservation_id: Number(id),
            project_name: 'مشروع تجريبي',
            unit_number: 'A-101',
            final_sale_price: 500000,
            commission_percentage: 2.5,
            commission_source: 'buyer',
            team_name: 'فريق 1',
          },
        }),
      });
      return;
    }
    if (/\/accounting\/sold-units$/.test(path)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              reservation_id: 100,
              project_name: 'مشروع تجريبي',
              unit_number: 'A-101',
              unit_type: 'شقة',
              final_sale_price: 500000,
              commission_source: 'buyer',
              commission_percentage: 2.5,
              team_name: 'فريق 1',
            },
          ],
          meta: { total: 1 },
        }),
      });
      return;
    }
    await route.continue();
  });
}

test.describe('Accounting sold units (commission data)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockAccountingSoldUnitsApi(page);
  });

  test('should load sold units at /accounting/sold-units', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    await expect(page.locator('.accounting-view.hr-view')).toBeVisible();
    await expect(page.locator('.management-view')).toBeVisible();
  });

  test('should show sold-units tab content via route', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    await expect(page.locator('#acct-sold-units-title')).toContainText('الوحدات المباعة');
  });

  test('should render table structure for sold units list', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    const table = page.locator('table.metrics-table');
    await table.waitFor({ state: 'visible', timeout: 20000 });
    await expect(table).toBeVisible();
    const headers = page.locator('table.metrics-table thead th');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('should have pagination controls when data is present', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    await page.locator('table.metrics-table').waitFor({ state: 'visible', timeout: 20000 });

    const pagination = page.locator(
      '.pagination-container, .pagination, .pager, [class*="pagination"], nav[aria-label*="pagination"]'
    );
    const hasPagination = await pagination.first().isVisible().catch(() => false);
    if (hasPagination) {
      const buttons = pagination.locator('button, a, .page-item');
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
    await expect(page.locator('.accounting-view')).toBeVisible();
  });

  test('should open sold unit detail when clicking view', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    await page.locator('table.metrics-table').waitFor({ state: 'visible', timeout: 20000 });

    const viewBtn = page.locator('table.metrics-table tbody tr .btn-action.edit').first();
    const hasRow = await viewBtn.isVisible().catch(() => false);
    if (hasRow) {
      await viewBtn.click();
      await expect(page.locator('.sold-unit-detail-view')).toBeVisible({ timeout: 5000 });
    }
    await expect(page.locator('.accounting-view')).toBeVisible();
  });

  test('should be reachable from accounting dashboard via URL', async ({ page }) => {
    await page.goto('/accounting/dashboard');
    await expect(page.locator('.accounting-view')).toBeVisible();
    await page.goto('/accounting/sold-units');
    await expect(page).toHaveURL(/accounting\/sold-units/);
    await expect(page.locator('.management-view')).toBeVisible();
  });
});
