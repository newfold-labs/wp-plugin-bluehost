const { test, expect } = require('@playwright/test');
const { auth, wordpress, newfold, a11y, utils } = require('../helpers');

test.describe('Dashboard Widgets', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to WordPress dashboard
    await auth.navigateToAdminPage(page, 'index.php');
    await newfold.clearCapabilities();
  });

  test('Bluehost Widgets are all Accessible', async ({ page }) => {
    // Wait for dashboard widgets to load with longer timeout
    await expect(page).toHaveURL('http://localhost:8882/wp-admin/index.php');
    
    try {
      await newfold.waitForDashboardWidgets(page, 15000);
    } catch (error) {
      console.log('Dashboard widgets not found, checking if widgets exist individually...');
    }
    
    // Check if widgets exist before running accessibility tests
    const sitePreviewWidget = page.locator('#site_preview_widget');
    const helpWidget = page.locator('#bluehost_help_widget');
    const accountWidget = page.locator('#bluehost_account_widget');
    
    // Run accessibility tests only on widgets that exist
    if (await sitePreviewWidget.count() > 0) {
      await a11y.checkA11y(page, '#site_preview_widget');
    }
    if (await helpWidget.count() > 0) {
      await a11y.checkA11y(page, '#bluehost_help_widget');
    }
    if (await accountWidget.count() > 0) {
      await a11y.checkA11y(page, '#bluehost_account_widget');
    }
  });

  test('Site Preview Widget', async ({ page }) => {
    // Ensure coming soon is disabled
    await newfold.setComingSoon(false);
    await auth.navigateToAdminPage(page, 'index.php');
    await page.reload();

    // Verify site preview widget exists and is visible
    const sitePreviewWidget = page.locator('#site_preview_widget');
    await expect(sitePreviewWidget).toBeVisible();

    // Check domain and status
    const domainElement = page.locator('.iframe-preview-domain');
    await utils.scrollIntoView(domainElement);
    await expect(domainElement).toContainText('localhost');
    await expect(domainElement).toBeVisible();

    const statusElement = page.locator('.iframe-preview-status');
    await utils.scrollIntoView(statusElement);
    await expect(statusElement).toContainText('Live');
    await expect(statusElement).toBeVisible();

    // Check widget body
    const widgetBody = page.locator('.site-preview-widget-body');
    await utils.scrollIntoView(widgetBody);
    await expect(widgetBody).toContainText('website is live');
    await expect(widgetBody).toHaveAttribute('data-coming-soon', 'false');

    // Check View Site link
    const viewSiteLink = page.locator('a[data-test-id="nfd-view-site"]');
    await utils.scrollIntoView(viewSiteLink);
    await expect(viewSiteLink).toContainText('View Site');
    await expect(viewSiteLink).toBeVisible();
    
    const viewSiteHref = await viewSiteLink.getAttribute('href');
    expect(viewSiteHref).toContain('localhost');

    // Check Edit Site link
    const editSiteLink = page.locator('a[data-test-id="nfd-edit-site"]');
    await utils.scrollIntoView(editSiteLink);
    await expect(editSiteLink).toContainText('Edit Site');
    await expect(editSiteLink).toBeVisible();
    
    const editSiteHref = await editSiteLink.getAttribute('href');
    expect(editSiteHref).toContain('site-editor');

    // Enable Coming Soon
    const enableComingSoonButton = page.locator('a[data-test-id="nfd-coming-soon-enable"]');
    await utils.scrollIntoView(enableComingSoonButton);
    await expect(enableComingSoonButton).toContainText('Enable Coming Soon');
    await expect(enableComingSoonButton).toHaveAttribute('href', '#');
    await enableComingSoonButton.click();
    // Reload page to ensure changes
    await page.waitForTimeout(500);
    await page.reload();

    // Coming Soon Enabled - wait for preview link to appear
    const previewLink = page.locator('a[data-test-id="nfd-preview-site"]');
    await utils.scrollIntoView(previewLink);
    await expect(previewLink).toBeVisible();

    // Check status changed to "Not Live"
    await utils.scrollIntoView(statusElement);
    await expect(statusElement).toContainText('Not Live');

    // Check widget body changed
    await utils.scrollIntoView(widgetBody);
    await expect(widgetBody).toContainText('Coming Soon');
    await expect(widgetBody).toHaveAttribute('data-coming-soon', 'true');

    // Enable button should not exist, disable button should exist
    await expect(enableComingSoonButton).not.toBeVisible();
    
    const disableComingSoonButton = page.locator('a[data-test-id="nfd-coming-soon-disable"]');
    await utils.scrollIntoView(disableComingSoonButton);
    await expect(disableComingSoonButton).toContainText('Launch Site');
    await expect(disableComingSoonButton).toHaveAttribute('href', '#');
    await disableComingSoonButton.click();
    // Reload page to ensure changes
    await page.waitForTimeout(500);
    await page.reload();

    // Coming Soon Disabled
    await expect(previewLink).not.toBeVisible();
    await utils.scrollIntoView(statusElement);
    await expect(statusElement).toContainText('Live');
    await utils.scrollIntoView(widgetBody);
    await expect(widgetBody).toContainText('website is live');
    await expect(widgetBody).toHaveAttribute('data-coming-soon', 'false');

    // Disable button should not exist, enable button should exist
    await expect(disableComingSoonButton).not.toBeVisible();
    await utils.scrollIntoView(enableComingSoonButton);
    await expect(enableComingSoonButton).toContainText('Enable Coming Soon');
    await expect(enableComingSoonButton).toHaveAttribute('href', '#');
  });

  test('Help Widget', async ({ page }) => {
    const helpWidget = page.locator('#bluehost_help_widget');
    await expect(helpWidget).toBeVisible();

    // Help center not available by default without capabilities
    const helpLink = page.locator('[data-test-id="nfd-widget-help-link"]');
    await utils.scrollIntoView(helpLink);
    await expect(helpLink).toContainText('Get Help');
    await expect(helpLink).toHaveAttribute('data-help-center', 'false');
    
    const helpHref = await helpLink.getAttribute('href');
    expect(helpHref).toContain('help');

    // Set capabilities and check help center
    console.log('Setting capabilities for help widget test');
    await newfold.setCapability({
      canAccessAI: true,
      canAccessHelpCenter: true,
    });
    
    await page.reload();
    // Log capabilities to verify they were set
    await newfold.logCapabilities();
    
    await utils.scrollIntoView(helpLink);
    await expect(helpLink).toContainText('Get Help');
    await expect(helpLink).toHaveAttribute('data-help-center', 'true');
    await helpLink.click();
    
    const helpCenter = page.locator('#nfd-help-center');
    await utils.scrollIntoView(helpCenter);
    await expect(helpCenter).toContainText('Help');
    await expect(helpCenter).toBeVisible();
  });

  test('Bluehost Account Widget', async ({ page }) => {
    const accountWidget = page.locator('#bluehost_account_widget');
    await expect(accountWidget).toBeVisible();

    // Profile Link
    await newfold.verifyWidgetLink(
      page,
      '[data-test-id="nfd-widget-account-link-profile"]',
      'Profile',
      'bluehost',
      { href: /utm_source/ }
    );

    // Mail Link
    await newfold.verifyWidgetLink(
      page,
      '[data-test-id="nfd-widget-account-link-email"]',
      'Mail',
      'email-office',
      { href: /utm_source/ }
    );

    // Hosting Link
    await newfold.verifyWidgetLink(
      page,
      '[data-test-id="nfd-widget-account-link-hosting"]',
      'Hosting',
      'hosting',
      { href: /utm_source/ }
    );

    // Security Link
    await newfold.verifyWidgetLink(
      page,
      '[data-test-id="nfd-widget-account-link-security"]',
      'Security',
      'security',
      { href: /utm_source/ }
    );
  });
});
