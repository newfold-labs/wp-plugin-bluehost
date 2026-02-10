import { test, expect } from '@playwright/test';
import { auth, utils } from '../helpers';

const MAIN_APP_PAGES = [
  { path: '/home', name: 'Home' },
  { path: '/settings', name: 'Settings' },
  { path: '/commerce', name: 'Commerce' },
  { path: '/marketplace', name: 'Marketplace' },
  { path: '/help', name: 'Help' },
];

const BLUEHOST_HOME = 'admin.php?page=bluehost#/home';

/**
 * Injects a setter for window.NewfoldRuntime so that when the page's script sets it
 * (e.g. from nfd-runtime), we merge in wordpress.hasYoastPremium = true.
 * Must be called before navigate so it runs before any page scripts.
 */
async function mockYoastPremiumInRuntime(page) {
  await page.addInitScript(() => {
    let _runtime = {};
    Object.defineProperty(window, 'NewfoldRuntime', {
      set(val) {
        _runtime =
          val && typeof val === 'object'
            ? {
                ...val,
                wordpress: {
                  ...(val.wordpress || {}),
                  hasYoastPremium: true,
                },
              }
            : val;
      },
      get() {
        return _runtime;
      },
      configurable: true,
    });
  });
}

test.describe('App Aside', () => {
  for (const { path, name } of MAIN_APP_PAGES) {
    test(`Aside is present on ${name} page`, async ({ page }) => {
      await auth.navigateToAdminPage(page, `admin.php?page=bluehost#${path}`);
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const aside = page.locator('[data-test-id="app-aside"]');
      await expect(aside).toBeVisible();
    });
  }

  test.describe('When Yoast Premium is not active', () => {
    test.beforeEach(async ({ page }) => {
      await auth.navigateToAdminPage(page, BLUEHOST_HOME);
    });

    test('Aside renders and displays Yoast ad', async ({ page }) => {
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const aside = page.locator('[data-test-id="app-aside"]');
      await utils.scrollIntoView(aside);
      await expect(aside).toBeVisible();
      await expect(aside).toHaveClass(/wppbh-app-aside/);
    });

    test('Yoast ad card shows title and key content', async ({ page }) => {
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const yoastAd = page.locator('[data-test-id="app-aside-yoast-ad"]');
      await utils.scrollIntoView(yoastAd);
      await expect(yoastAd).toBeVisible();
      await expect(yoastAd.locator('h2')).toContainText('Yoast SEO Premium');
      await expect(yoastAd).toContainText('Spend less time on SEO tasks!');
      await expect(yoastAd).toContainText('Buy now');
    });

    test('Yoast buy link has correct href and opens in new tab', async ({ page }) => {
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const buyLink = page.locator('[data-test-id="app-aside-yoast-buy-link"]');
      await utils.scrollIntoView(buyLink);
      await expect(buyLink).toBeVisible();
      await expect(buyLink).toHaveAttribute('href', /yoa\.st/);
      await expect(buyLink).toHaveAttribute('target', '_blank');
      await expect(buyLink).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(buyLink).toHaveAttribute('data-ctb-id', 'f6a84663-465f-4cb5-8ba5-f7a6d72224b2');
    });
  });

  test.describe('When Yoast Premium is active (runtime mocked in JS)', () => {
    test.beforeEach(async ({ page }) => {
      await mockYoastPremiumInRuntime(page);
      await auth.navigateToAdminPage(page, BLUEHOST_HOME);
    });

    test('Aside is visible but Yoast ad is not shown', async ({ page }) => {
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const aside = page.locator('[data-test-id="app-aside"]');
      await expect(aside).toBeAttached();
      const yoastAd = page.locator('[data-test-id="app-aside-yoast-ad"]');
      await expect(yoastAd).toHaveCount(0);
    });

    test('Yoast buy link is not present', async ({ page }) => {
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const buyLink = page.locator('[data-test-id="app-aside-yoast-buy-link"]');
      await expect(buyLink).toHaveCount(0);
    });
  });
});
