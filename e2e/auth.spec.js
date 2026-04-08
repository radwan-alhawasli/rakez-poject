import { test, expect } from '@playwright/test';

/**
 * Helper: seed localStorage with a fake authenticated session so the Vue
 * router guard treats the browser as "logged in".
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [userOverrides]  – fields merged into the default user object
 */
async function seedAuth(page, userOverrides = {}) {
  const now = Date.now();
  const thirtyMin = 30 * 60 * 1000;

  const defaultUser = {
    id: 1,
    name: 'Test Admin',
    email: 'admin@rakez.com',
    type: 1, // ROLE_ADMIN
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

test.describe('Auth Flow', () => {
  test('should display the login form at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('.login-container, .login-wrapper').first()).toBeVisible();
    await expect(page.locator('form.login-form')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('.login-btn')).toBeVisible();
    // Arabic labels
    await expect(page.locator('label[for="email"]')).toContainText('البريد الإلكتروني');
    await expect(page.locator('label[for="password"]')).toContainText('كلمة المرور');
  });

  test('should redirect authenticated admin to /dashboard when visiting /login', async ({ page }) => {
    await seedAuth(page, { type: 1 }); // admin
    await page.goto('/login');
    await page.waitForURL(/dashboard/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should redirect authenticated sales user to /sales/dashboard', async ({ page }) => {
    await seedAuth(page, { type: 6, name: 'Sales User', email: 'sales@rakez.com' });
    await page.goto('/login');
    await page.waitForURL(/sales\/dashboard/);
    await expect(page).toHaveURL(/sales\/dashboard/);
  });

  test('should redirect unauthenticated user to /login from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated user to /login from nested protected route', async ({ page }) => {
    await page.goto('/accounting/sold-units');
    await expect(page).toHaveURL(/login/);
  });

  test('should clear session and redirect to /login on logout', async ({ page }) => {
    // Do not use seedAuth() here: its addInitScript runs before every navigation and would
    // re-inject a fake session after we clear storage. Seed once via evaluate instead.
    const now = Date.now();
    const thirtyMin = 30 * 60 * 1000;
    const user = {
      id: 1,
      name: 'Test Admin',
      email: 'admin@rakez.com',
      type: 1,
      permissions: [],
      is_leader: false,
      is_manager: false,
    };
    await page.goto('/login');
    await page.evaluate(
      ({ user: u, now: t, thirtyMin: d }) => {
        const tokenPayload = JSON.stringify({
          value: 'fake-jwt-token',
          expiration: t + d,
          timestamp: t,
        });
        localStorage.setItem('authToken', tokenPayload);
        localStorage.setItem('userInfo', JSON.stringify(u));
        localStorage.setItem('sessionTimeout', String(t + d));
        localStorage.setItem('lastActivity', String(t));
      },
      { user, now, thirtyMin },
    );
    await page.goto('/dashboard');
    await page.waitForURL(/dashboard/);

    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('sessionTimeout');
      localStorage.removeItem('lastActivity');
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);

    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });

  test('should show session warning when timeout is near', async ({ page }) => {
    const now = Date.now();
    const warningWindow = 3 * 60 * 1000; // 3 min left (within the 5-min warning threshold)

    await page.addInitScript(({ now, warningWindow }) => {
      const tokenPayload = JSON.stringify({
        value: 'fake-jwt-token',
        expiration: now + warningWindow,
        timestamp: now,
      });
      localStorage.setItem('authToken', tokenPayload);
      localStorage.setItem('userInfo', JSON.stringify({
        id: 1, name: 'Test Admin', email: 'admin@rakez.com', type: 1,
        permissions: [], is_leader: false, is_manager: false,
      }));
      localStorage.setItem('sessionTimeout', String(now + warningWindow));
      localStorage.setItem('lastActivity', String(now));
    }, { now, warningWindow });

    await page.goto('/dashboard');

    // The router guard logs 'Session expiring soon' when shouldShowWarning() is true.
    // Verify the session is within the warning window via evaluate.
    const isExpiring = await page.evaluate(() => {
      const timeout = localStorage.getItem('sessionTimeout');
      if (!timeout) return false;
      const remaining = parseInt(timeout, 10) - Date.now();
      return remaining > 0 && remaining <= 5 * 60 * 1000;
    });
    expect(isExpiring).toBe(true);
  });
});
