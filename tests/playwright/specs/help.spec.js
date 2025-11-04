const { test, expect } = require('@playwright/test');
const { auth, a11y, utils } = require('../helpers');

test.describe('Help Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API intercepts for marketplace and notifications
    await page.route('**/newfold-marketplace**/v1**/marketplace**', async route => {
      // Mock marketplace response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [],
          notifications: []
        })
      });
    });

    await page.route('**/newfold-notifications**/v1**/notifications**', async route => {
      // Mock notifications response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: []
        })
      });
    });

    // Navigate to help page
    await auth.navigateToAdminPage(page, 'admin.php?page=bluehost#/help');
  });

  test('A11y and Cards Each Exist', async ({ page }) => {
    // Wait for the main app container to be rendered
    await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
    
    // Wait for the app body to be visible
    await page.waitForSelector('.wppbh-app-body', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wppbh-app-body');

    // Verify all help cards exist and are visible
    const helpCards = [
      { selector: '.card-help-phone', title: 'Phone' },
      { selector: '.card-help-chat', title: 'Chat' },
      { selector: '.card-help-twitter', title: 'Tweet' },
      { selector: '.card-help-youtube', title: 'YouTube' },
      { selector: '.card-help-kb', title: 'Knowledge Base' },
      { selector: '.card-help-resources', title: 'Resources' },
      { selector: '.card-help-events', title: 'Events and Webinars' },
      { selector: '.card-help-website', title: 'Bluehost Website' }
    ];

    for (const card of helpCards) {
      const cardElement = page.locator(card.selector);
      await utils.scrollIntoView(cardElement);
      await expect(cardElement).toBeVisible();
      await expect(cardElement.locator('h3')).toContainText(card.title);
    }
  });
});
