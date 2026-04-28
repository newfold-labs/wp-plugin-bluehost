import { test, expect } from '@playwright/test';
import {
  wordpress,
  navigateToInsightsPage,
  waitForInsightsPage,
  prepareInsightsPreconditions,
  setInsightsCapability,
} from '../helpers/index.mjs';

test.describe('Insights Module', () => {
  test.beforeEach(async ({ page }) => {
    const pre = await prepareInsightsPreconditions(page, {
      canScanPerformance: true,
      retries: 1,
    });
    test.skip(!pre.ok, pre.reason);
  });

  test('App loads without errors', async ({ page }) => {
    await navigateToInsightsPage(page);
    await waitForInsightsPage(page);

    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).not.toContainText('Error:');
    await expect(page.locator('#nfd-insights-app')).toBeVisible();
  });

  test('Insights page title is visible', async ({ page }) => {
    await navigateToInsightsPage(page);
    await waitForInsightsPage(page);

    await expect(page.locator('#nfd-insights-app')).toContainText('Insights');
  });

  test('Insights page is not visible in Tools submenu when capability is disabled', async ({ page }) => {
    const disabled = await setInsightsCapability(false, 1);
    test.skip(!disabled, 'Unable to verify canScanPerformance=false after retries.');

    await page.goto('/wp-admin/tools.php', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForLoadState('load');

    const insightsLink = page.locator('#adminmenu a[href*="page=nfd-insights"]');
    await expect(insightsLink).toBeHidden();
  });
});
