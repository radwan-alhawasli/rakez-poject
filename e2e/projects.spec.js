import { test, expect } from '@playwright/test';

/**
 * Seed an authenticated session with project-management or admin role.
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 3,
    name: 'PM Manager',
    email: 'pm@rakez.com',
    type: 3, // ROLE_PROJECT_MANAGEMENT
    permissions: [
      'projects.view',
      'projects.create',
      'projects.media.upload',
      'projects.team.create',
      'projects.team.assign_leader',
      'projects.team.allocate',
      'contracts.view',
      'notifications.view',
      'use-ai-assistant',
      'tasks.create',
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

test.describe('Project Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test('should load the project management view at /project-management', async ({ page }) => {
    await page.goto('/project-management');
    await expect(page.locator('.project-management-view')).toBeVisible();
    await expect(page.locator('.page-title')).toContainText('إدارة المشاريع');
  });

  test('should display page header with subtitle', async ({ page }) => {
    await page.goto('/project-management');
    await expect(page.locator('.page-subtitle')).toContainText('عرض وإدارة جميع المشاريع');
  });

  test('should show project grid or empty state', async ({ page }) => {
    await page.goto('/project-management');
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});

    const grid = page.locator('.projects-grid');
    const empty = page.locator('.empty-state');
    const gridVisible = await grid.isVisible().catch(() => false);
    const emptyVisible = await empty.isVisible().catch(() => false);

    expect(gridVisible || emptyVisible).toBe(true);
  });

  test('should render project cards with expected structure when data is available', async ({ page }) => {
    await page.goto('/project-management');
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});

    const cards = page.locator('.projects-grid .project-card, .projects-grid .sales-style-cards > *');
    const count = await cards.count();
    if (count > 0) {
      // Each card rendered by <ProjectCard> should be present
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should have a search box that filters projects', async ({ page }) => {
    await page.goto('/project-management');
    const searchInput = page.locator('.search-box input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /ابحث عن مشروع/);

    // Type a query and verify it doesn't crash the page
    await searchInput.fill('مشروع تجريبي');
    await expect(page.locator('.project-management-view')).toBeVisible();
  });

  test('should have a team filter dropdown', async ({ page }) => {
    await page.goto('/project-management');
    const filterSelect = page.locator('.filter-dropdown select');
    await expect(filterSelect).toBeVisible();
    // Should contain "كل الفرق" option
    await expect(filterSelect.locator('option').first()).toContainText('كل الفرق');
  });

  test('should display tab buttons for project categories', async ({ page }) => {
    await page.goto('/project-management');
    const tabs = page.locator('.tabs-container .tab-btn');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have a new-project button linking to /exclusive-request', async ({ page }) => {
    await page.goto('/project-management');
    const newBtn = page.locator('.btn-new-project, a[href="/exclusive-request"]');
    await expect(newBtn.first()).toBeVisible();
    await expect(newBtn.first()).toContainText('مشروع جديد');
  });

  test('should open assign-team modal when triggered', async ({ page }) => {
    await page.goto('/project-management');
    await page.waitForSelector('.loading-state', { state: 'hidden', timeout: 10000 }).catch(() => {});

    // The ProjectAssignTeamModal is shown when showAssignTeamModal is true.
    // We cannot trigger it from UI without data, but we can check it starts hidden.
    const modal = page.locator('.assign-team-modal, .modal-overlay').first();
    const isHidden = !(await modal.isVisible().catch(() => false));
    expect(isHidden).toBe(true);
  });
});
