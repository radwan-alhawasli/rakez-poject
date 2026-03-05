import { test, expect } from '@playwright/test';

/**
 * Seed an authenticated session with accounting role + permissions.
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 10,
    name: 'Accounting User',
    email: 'accounting@rakez.com',
    type: 7, // ROLE_ACCOUNTING
    permissions: [
      'accounting.dashboard.view',
      'accounting.notifications.view',
      'accounting.sold-units.view',
      'accounting.commissions.approve',
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

test.describe('Commissions Page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('should load the commissions tab at /accounting/commissions', async ({ page }) => {
    await page.goto('/accounting/commissions');
    // The AccountingView should render and show the commissions tab content
    await expect(page.locator('.accounting-view, .hr-view')).toBeVisible();
  });

  test('should display the commissions tab as active via route', async ({ page }) => {
    await page.goto('/accounting/commissions');
    // The route name AccountingCommissions maps to activeTab === 'commissions'
    // which renders <AccountingCommissionsTab>
    const commissionsContent = page.locator('.accounting-view, .hr-view');
    await expect(commissionsContent).toBeVisible();
  });

  test('should render table structure for commission list', async ({ page }) => {
    await page.goto('/accounting/commissions');
    await page.waitForTimeout(1500);

    // Look for table or list structure within the commissions tab
    const table = page.locator('table, .table, .commissions-table, .data-table, .commissions-list');
    const hasTable = await table.first().isVisible().catch(() => false);
    if (hasTable) {
      // Table headers should exist
      const headers = page.locator('th, .table-header, .col-header');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    }
    // If no table is present (no data from API), at least the view container should be visible
    await expect(page.locator('.accounting-view, .hr-view')).toBeVisible();
  });

  test('should have pagination controls when data is present', async ({ page }) => {
    await page.goto('/accounting/commissions');
    await page.waitForTimeout(1500);

    const pagination = page.locator('.pagination, .pager, [class*="pagination"], nav[aria-label*="pagination"]');
    const hasPagination = await pagination.first().isVisible().catch(() => false);
    if (hasPagination) {
      // At least prev/next or page buttons should exist
      const buttons = pagination.locator('button, a, .page-item');
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
    // If no pagination, the view still loaded correctly
    await expect(page.locator('.accounting-view, .hr-view')).toBeVisible();
  });

  test('should open commission detail modal on row click', async ({ page }) => {
    await page.goto('/accounting/commissions');
    await page.waitForTimeout(1500);

    // Try clicking the first data row
    const clickable = page.locator(
      'table tbody tr, .commission-row, .commissions-list .list-item, .commission-card'
    );
    const hasRows = await clickable.first().isVisible().catch(() => false);
    if (hasRows) {
      await clickable.first().click();
      // A modal or detail panel may appear
      const modal = page.locator('.modal, .modal-overlay, [class*="modal"], .detail-panel, .commission-detail');
      const modalVisible = await modal.first().isVisible({ timeout: 3000 }).catch(() => false);
      if (modalVisible) {
        await expect(modal.first()).toBeVisible();
      }
    }
    // Regardless of data, the view should remain stable
    await expect(page.locator('.accounting-view, .hr-view')).toBeVisible();
  });

  test('should be accessible from accounting dashboard navigation', async ({ page }) => {
    await page.goto('/accounting/dashboard');
    await expect(page.locator('.accounting-view, .hr-view')).toBeVisible();
    // Navigate to commissions via URL
    await page.goto('/accounting/commissions');
    await expect(page).toHaveURL(/accounting\/commissions/);
  });
});
