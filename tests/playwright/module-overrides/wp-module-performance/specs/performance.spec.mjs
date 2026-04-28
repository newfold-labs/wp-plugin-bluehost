import { test, expect } from '@playwright/test';
import {
  a11y,
  SELECTORS,
  setupAndNavigate,
  setLinkPrefetchSettings,
  setLinkPrefetchCapabilities,
  clearSiteCapabilities,
  expectNotification,
  verifyLinkPrefetchDisplayed,
  ensureLinkPrefetchToggleEnabled,
  checkLinkPrefetchCapabilities,
} from '../helpers/index.mjs';

test.describe('Performance Page', () => {
  test.afterEach(async () => {
    await clearSiteCapabilities();
  });

  test('Is Accessible', async ({ page }) => {
    const pre = await setupAndNavigate(page);
    test.skip(!pre.ok, pre.reason);

    await a11y.checkA11y(page, SELECTORS.performancePage);
  });

  test('Has Cache Settings', async ({ page }) => {
    const pre = await setupAndNavigate(page);
    test.skip(!pre.ok, pre.reason);

    const cacheSettings = page.locator(SELECTORS.cacheSettings);
    await cacheSettings.scrollIntoViewIfNeeded();
    await expect(cacheSettings).toBeVisible();
  });

  test('Has Clear Cache Settings', async ({ page }) => {
    const pre = await setupAndNavigate(page);
    test.skip(!pre.ok, pre.reason);

    const clearCache = page.locator(SELECTORS.clearCache);
    await clearCache.scrollIntoViewIfNeeded();
    await expect(clearCache).toBeVisible();
  });

  test('Clear Cache Disabled when Cache is Disabled', async ({ page }) => {
    const pre = await setupAndNavigate(page);
    test.skip(!pre.ok, pre.reason);

    // Disable cache
    await page.locator(SELECTORS.cacheLevelOff).check();

    // Verify clear cache button is disabled (auto-waits for state)
    const clearCacheButton = page.locator(SELECTORS.clearCacheButton);
    await clearCacheButton.scrollIntoViewIfNeeded();
    await expect(clearCacheButton).toBeDisabled();

    // Enable cache
    await page.locator(SELECTORS.cacheLevelOn).check();

    // Verify clear cache button is enabled
    await expect(clearCacheButton).toBeEnabled();

    // Verify notification appears
    await expectNotification(page, 'Cache');
  });

  test('Clear Cache Button Functions', async ({ page }) => {
    const pre = await setupAndNavigate(page);
    test.skip(!pre.ok, pre.reason);

    await page.locator(SELECTORS.clearCacheButton).click();
    await expectNotification(page, 'Cache');
  });

  test('Link Prefetch displays with capabilities enabled', async ({ page }) => {
    const pre = await setLinkPrefetchCapabilities({
      hasLinkPrefetchClick: true,
      hasLinkPrefetchHover: true,
    });
    test.skip(!pre.ok, pre.reason);

    const pagePre = await setupAndNavigate(page);
    test.skip(!pagePre.ok, pagePre.reason);

    await verifyLinkPrefetchDisplayed(page);
    await ensureLinkPrefetchToggleEnabled(page);
  });

  test('hasLinkPrefetchClick capability shows only mouseDown option', async ({ page }) => {
    // Set settings and capabilities
    await setLinkPrefetchSettings({ activeOnDesktop: true, behavior: 'mouseDown' });
    const pre = await setLinkPrefetchCapabilities({
      hasLinkPrefetchClick: true,
      hasLinkPrefetchHover: false,
    });
    test.skip(!pre.ok, pre.reason);

    const pagePre = await setupAndNavigate(page);
    test.skip(!pagePre.ok, pagePre.reason);

    await verifyLinkPrefetchDisplayed(page);
    await ensureLinkPrefetchToggleEnabled(page);
    await checkLinkPrefetchCapabilities(page, 'onlyMouseDown');
  });

  test('hasLinkPrefetchHover capability shows both options', async ({ page }) => {
    // Set settings and capabilities
    await setLinkPrefetchSettings({ activeOnDesktop: true, behavior: 'mouseHover' });
    const pre = await setLinkPrefetchCapabilities({
      hasLinkPrefetchClick: true,
      hasLinkPrefetchHover: true,
    });
    test.skip(!pre.ok, pre.reason);

    const pagePre = await setupAndNavigate(page);
    test.skip(!pagePre.ok, pagePre.reason);

    await verifyLinkPrefetchDisplayed(page);
    await ensureLinkPrefetchToggleEnabled(page);
    await checkLinkPrefetchCapabilities(page, 'both');
  });

  test('Link Prefetch hidden when capabilities are false', async ({ page }) => {
    const pre = await setLinkPrefetchCapabilities({
      hasLinkPrefetchClick: false,
      hasLinkPrefetchHover: false,
    });
    test.skip(!pre.ok, pre.reason);

    const pagePre = await setupAndNavigate(page);
    test.skip(!pagePre.ok, pagePre.reason);

    await expect(page.locator(SELECTORS.linkPrefetchSettings)).toHaveCount(0);
  });
});
