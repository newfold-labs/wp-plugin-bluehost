import { test, expect } from '@playwright/test';
import { auth, utils } from '../helpers';

const MAIN_APP_PAGES = [
  { path: '/home', name: 'Home' },
  { path: '/settings', name: 'Settings' },
  { path: '/commerce', name: 'Commerce' },
  { path: '/marketplace', name: 'Marketplace' },
  { path: '/help', name: 'Help' },
];

test.describe('App Aside', () => {
  for (const { path, name } of MAIN_APP_PAGES) {
    test(`Aside is present on ${name} page`, async ({ page }) => {
      await auth.navigateToAdminPage(page, `admin.php?page=bluehost#${path}`);
      await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
      const aside = page.locator('[data-test-id="app-aside"]');
      await expect(aside).toBeVisible();
    });
  }

  test.describe('Aside content (home)', () => {
    test.beforeEach(async ({ page }) => {
      await auth.navigateToAdminPage(page, 'admin.php?page=bluehost#/home');
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
});
