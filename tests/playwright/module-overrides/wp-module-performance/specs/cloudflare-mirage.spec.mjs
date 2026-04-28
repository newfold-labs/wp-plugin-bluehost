import { test, expect } from '@playwright/test';
import {
  CLOUDFLARE_HASHES,
  setSiteCapabilities,
  clearSiteCapabilities,
  clearImageOptimizationOption,
  getCloudflareToggle,
  verifyCloudflareToggleState,
  setCloudflareToggle,
  assertHtaccessHasRule,
  assertHtaccessHasNoRule,
  navigateToPerformancePage,
  waitForPerformancePage,
  ensureHealthyHtaccess,
  auth,
} from '../helpers/index.mjs';

test.describe('Cloudflare Mirage Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await clearImageOptimizationOption();
    const htaccess = await ensureHealthyHtaccess();
    test.skip(!htaccess.ok, htaccess.reason);
    await auth.loginToWordPress(page);
  });

  test.afterAll(async () => {
    await clearImageOptimizationOption();
    await clearSiteCapabilities();
  });

  test('Shows Mirage section when capability is true and toggle is enabled', async ({ page }) => {
    // Visit first, set capability, then reload (same as fonts) so the SPA reads fresh transient data.
    await navigateToPerformancePage(page);
    let ready = await waitForPerformancePage(page);
    test.skip(!ready, 'Performance page unavailable after recovery attempts.');

    const pre = await setSiteCapabilities({ hasCloudflareMirage: true });
    test.skip(!pre.ok, pre.reason);
    await page.reload();
    ready = await waitForPerformancePage(page);
    test.skip(!ready, 'Performance page unavailable after recovery attempts.');

    // Verify toggle exists and is enabled
    const toggle = getCloudflareToggle(page, 'mirage');
    await expect(toggle).toBeVisible({ timeout: 20000 });
    await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 20000 });

    // Click to disable and verify
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 20000 });
  });

  test('Does not show Mirage section when capability is false', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareMirage: false });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    const ready = await waitForPerformancePage(page);
    test.skip(!ready, 'Performance page unavailable after recovery attempts.');

    const toggle = getCloudflareToggle(page, 'mirage');
    await expect(toggle).toHaveCount(0);
  });

  test('Writes correct rewrite rules to .htaccess when Mirage is enabled', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareMirage: true });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    const ready = await waitForPerformancePage(page);
    test.skip(!ready, 'Performance page unavailable after recovery attempts.');

    // Verify toggle is enabled
    await verifyCloudflareToggleState(page, 'mirage', 'true');

    // Check .htaccess has the rule
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.mirage);
  });

  test('Toggles Mirage on/off and updates .htaccess accordingly', async ({ page }) => {
    const pre = await setSiteCapabilities({ hasCloudflareMirage: true });
    test.skip(!pre.ok, pre.reason);

    await navigateToPerformancePage(page);
    const ready = await waitForPerformancePage(page);
    test.skip(!ready, 'Performance page unavailable after recovery attempts.');

    // Verify initially enabled
    await verifyCloudflareToggleState(page, 'mirage', 'true');
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.mirage);

    // Toggle OFF
    await setCloudflareToggle(page, 'mirage', false);
    await assertHtaccessHasNoRule(CLOUDFLARE_HASHES.mirage);

    // Toggle ON again
    await setCloudflareToggle(page, 'mirage', true);
    await assertHtaccessHasRule(CLOUDFLARE_HASHES.mirage);
  });
});
