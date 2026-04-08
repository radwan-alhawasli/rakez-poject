import { test, expect } from '@playwright/test';

/**
 * Seed an authenticated session with the given role/permissions.
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 1,
    name: 'Sales Agent',
    email: 'sales@rakez.com',
    type: 5, // ROLE_SALES
    permissions: [
      'sales.dashboard.view',
      'sales.reservations.view',
      'sales.reservations.create',
      'sales.reservations.confirm',
      'sales.reservations.cancel',
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

test.describe('Reservations Page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('should load the reservations page at /reservations', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page.locator('.reservations-page, .my-reservations')).toBeVisible();
    await expect(page.locator('.welcome-title')).toContainText('حجوزاتي');
  });

  test('should display filter tabs for active, cancelled, waiting, and negotiations', async ({ page }) => {
    await page.goto('/reservations');
    const tabs = page.locator('.filter-tabs .tab-btn');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('حجوزات');
    await expect(tabs.nth(1)).toContainText('حجوزات ملغاة');
    await expect(tabs.nth(2)).toContainText('انتظار');
    await expect(tabs.nth(3)).toContainText('تفاوضات');
  });

  test('should switch tab content when clicking cancelled tab', async ({ page }) => {
    await page.goto('/reservations');
    const cancelledTab = page.locator('.filter-tabs .tab-btn', { hasText: 'حجوزات ملغاة' });
    await cancelledTab.click();
    await expect(cancelledTab).toHaveClass(/active/);
  });

  test('should switch tab content when clicking waiting tab', async ({ page }) => {
    await page.goto('/reservations');
    const waitingTab = page.locator('.filter-tabs .tab-btn', { hasText: 'انتظار' });
    await waitingTab.click();
    await expect(waitingTab).toHaveClass(/active/);
  });

  test('should show empty state or reservation list', async ({ page }) => {
    await page.goto('/reservations');
    // Without a real API the page will show either loading → empty state, or the list
    const emptyOrList = page.locator('.empty-state, .reservations-list, .loading-state');
    await expect(emptyOrList.first()).toBeVisible();
  });

  test('should render reservation cards when list is visible', async ({ page }) => {
    await page.goto('/reservations');
    // Wait for loading to finish
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});

    const list = page.locator('.reservations-list');
    const hasCards = await list.isVisible().catch(() => false);
    if (hasCards) {
      const cards = page.locator('.reservation-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      // Each card should have a status badge
      await expect(cards.first().locator('.card-status-badge')).toBeVisible();
    } else {
      // Empty state is acceptable when no API is running
      await expect(page.locator('.empty-state')).toBeVisible();
    }
  });

  test('should have page subtitle describing purpose', async ({ page }) => {
    await page.goto('/reservations');
    await expect(page.locator('.welcome-subtitle')).toContainText('عرض جميع الوحدات التي قمت بحجزها');
  });

  test('should keep active tab highlighted by default', async ({ page }) => {
    await page.goto('/reservations');
    const activeTab = page.locator('.filter-tabs .tab-btn').first();
    await expect(activeTab).toHaveClass(/active/);
  });
});
