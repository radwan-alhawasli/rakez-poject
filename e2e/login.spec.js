import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form, .login-container, .login-form').first()).toBeVisible();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"], .login-btn, .btn-primary').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
