import { test, expect } from '@playwright/test';
import {
  auth,
  getAppClass,
  setComingSoonOption,
  navigateToWpAdmin,
  navigateToFrontend,
  removeWooCommerce,
  verifyAdminNotice,
  verifySitePreviewWarning,
  verifyComingSoonFrontend,
  navigateToSettings,
  verifyComingSoonActive,
} from '../helpers';

// Use environment variable to resolve plugin helpers
const pluginId = process.env.PLUGIN_ID || 'bluehost';

test.describe('Coming Soon', () => {
  const appClass = getAppClass();

  test.beforeAll(async () => {
    // Remove WooCommerce
    await removeWooCommerce();
  });

  test.beforeEach(async ({ page }) => {
    // Login to WordPress
    await auth.loginToWordPress(page);
    
    // Set coming soon option to true to start with
    await setComingSoonOption(page, true);
    
    // Navigate to WordPress admin
    await navigateToWpAdmin(page);
  });

  test('Coming Soon is active', async ({ page }) => {
    await navigateToSettings(page, pluginId);
    await page.reload();

    // Verify coming soon is active
    await verifyComingSoonActive(page, appClass);
  });

  test('Coming Soon can be disabled and re-enabled via dashboard widget', async ({ page }) => {
    // Go to dashboard
    await page.goto('/wp-admin/index.php');
    
    // Find and click the disable button on the coming soon widget
    let disableButton = page.locator('[data-test-id="nfd-coming-soon-disable"]');
    await expect(disableButton).toBeVisible();
    await disableButton.click();

    // Verify coming soon is now disabled - the enable button should appear
    const enableButton = page.locator('[data-test-id="nfd-coming-soon-enable"]');
    await expect(enableButton).toBeVisible({ timeout: 20000 });

    // Re-enable coming soon by clicking the enable button
    await enableButton.click();
    // Re-find the disable button after the page has reloaded
    disableButton = page.locator('[data-test-id="nfd-coming-soon-disable"]');

    // Verify coming soon is now enabled - the disable button should appear again
    await expect(disableButton).toBeVisible({ timeout: 20000 });
  });

  test('Displays admin coming soon notice', async ({ page }) => {
    await navigateToWpAdmin(page);
    await verifyAdminNotice(page);
  });

  test('Displays Coming Soon Site Preview Warning', async ({ page }) => {
    await navigateToFrontend(page);
    await verifySitePreviewWarning(page);
  });

  test('Displays Coming Soon on Frontend', async ({ page }) => {
    // Simulate logged-out by clearing cookies and storage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await navigateToFrontend(page);
    await verifyComingSoonFrontend(page);
  });

});
