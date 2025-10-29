const { test, expect } = require('@playwright/test');
const { auth, a11y, utils } = require('../helpers');

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await auth.navigateToAdminPage(page, 'admin.php?page=bluehost#/home');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for the home page to load - check for the main app container and home page class
    await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
    await page.waitForSelector('.wppbh-page-home', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wppbh-app-body');
  });

  test('Home Page Quick Links exist', async ({ page }) => {
    // Welcome text
    const welcomeHeading = page.locator('.wppbh-app-body').locator('h1').first();
    await utils.scrollIntoView(welcomeHeading);
    await expect(welcomeHeading).toBeVisible();

    // Yoast CTB Card
    const yoastCard = page.locator('[data-test-id="quick-links-yoast-link"]');
    await utils.scrollIntoView(yoastCard);
    await expect(yoastCard.locator('h2')).toContainText('Optimize');
    await expect(yoastCard).toHaveAttribute('data-ctb-id', '57d6a568-783c-45e2-a388-847cff155897');
    const yoastHref = await yoastCard.getAttribute('href');
    expect(yoastHref).toContain('yoast.com');

    // Manage WordPress card
    const manageWordPressCard = page.locator('[data-test-id="quick-links-settings-link"]');
    await utils.scrollIntoView(manageWordPressCard);
    await expect(manageWordPressCard.locator('h2')).toContainText('Manage');
    const manageWordPressHref = await manageWordPressCard.getAttribute('href');
    expect(manageWordPressHref).toContain('#/settings');

    // Launch AI Editor card
    const launchAICard = page.locator('[data-test-id="quick-links-ai-editor-link"]');
    await utils.scrollIntoView(launchAICard);
    await expect(launchAICard.locator('h2')).toContainText('Launch');
    const launchAIHref = await launchAICard.getAttribute('href');
    expect(launchAIHref).toContain('site-editor');

    // Help Card
    const helpCard = page.locator('[data-test-id="quick-links-help-link"]');
    await utils.scrollIntoView(helpCard);
    await expect(helpCard.locator('h2')).toContainText('Help');
    const helpHref = await helpCard.getAttribute('href');
    expect(helpHref).toContain('#/help');

    // Pro Design Card
    const proDesignCard = page.locator('[data-test-id="quick-links-pro-design-link"]');
    await utils.scrollIntoView(proDesignCard);
    await expect(proDesignCard.locator('h2')).toContainText('Pro');
    const proDesignHref = await proDesignCard.getAttribute('href');
    expect(proDesignHref).toContain('bluehost.com/my-account/market-place');
    expect(proDesignHref).toContain('utm_source');
    expect(proDesignHref).toContain('utm_medium');

    // Referral Program Card
    const referralCard = page.locator('[data-test-id="quick-links-refer-friend-link"]');
    await utils.scrollIntoView(referralCard);
    await expect(referralCard.locator('h2')).toContainText('Refer');
    const referralHref = await referralCard.getAttribute('href');
    expect(referralHref).toContain('bluehost.com/affiliates');
    expect(referralHref).toContain('utm_source');
    expect(referralHref).toContain('utm_medium');

  });
});
