import { test, expect } from '@playwright/test';
import {
  CLOUDFLARE_HASHES,
  setSiteCapabilities,
  clearSiteCapabilities,
  clearFontOptimizationOption,
  getCloudflareToggle,
  verifyCloudflareToggleState,
  setCloudflareToggle,
  assertHtaccessHasRule,
  assertHtaccessHasNoRule,
  navigateToPerformancePage,
  waitForPerformancePage,
  auth,
} from '../helpers/index.mjs';

test.describe('Cloudflare Font Optimization Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await clearFontOptimizationOption();
    await auth.loginToWordPress(page);
  });

  test.afterAll(async () => {
    await clearFontOptimizationOption();
    await clearSiteCapabilities();
  });

  test('Shows Font Optimization section when capability is true and toggle is enabled', async ({ page }) => {
    // Visit page first to initialize, then set capability, then reload
    await navigateToPerformancePage(page);
    await waitForPerformancePage(page);

    const pre = await setSiteCapabilities({ hasCloudflareFonts: true });
    test.skip(!pre.ok, pre.reason);
    await page.reload();
    await waitForPerformancePage(page);

    // Verify toggle exists and is enabled
    const toggle = getCloudflareToggle(page, 'fonts');
    await expect(toggle).toBeVisible({ timeout: 20000 });
    await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 20000 });

    // Click to disable and verify
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 20000 });
  });

  test('Does not show Font Optimization section when capability is false', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareFonts: false });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    await waitForPerformancePage(page);

    const toggle = getCloudflareToggle(page, 'fonts');
    await expect(toggle).toHaveCount(0);
  });

  test('Writes correct rewrite rules to .htaccess when Font Optimization is enabled', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareFonts: true });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    await waitForPerformancePage(page);

    // Verify toggle is enabled
    await verifyCloudflareToggleState(page, 'fonts', 'true');

    // Check .htaccess has the rule
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.fonts);
  });

  test('Toggles Font Optimization on/off and updates .htaccess accordingly', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareFonts: true });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    await waitForPerformancePage(page);

    // Verify initially enabled
    await verifyCloudflareToggleState(page, 'fonts', 'true');
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.fonts);

    // Toggle OFF
    await setCloudflareToggle(page, 'fonts', false);
    await assertHtaccessHasNoRule(CLOUDFLARE_HASHES.fonts);

    // Toggle ON again
    await setCloudflareToggle(page, 'fonts', true);
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.fonts);
  });
});
