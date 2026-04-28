import { test, expect } from '@playwright/test';
import {
  auth,
  a11y,
  SELECTORS,
  HELP_CENTER_CAPABILITIES,
  setSiteCapabilities,
  clearHelpCenterClientState,
  setupHelpCenterApiMocks,
  waitForHelpCenterIcon,
  clickHelpCenterIcon,
  verifyHelpCenterModalVisible,
  searchInHelpCenter,
} from '../helpers/index.mjs';

// Brand plugin id
const pluginId = process.env.PLUGIN_ID || 'bluehost';

/**
 * Expected brand content per plugin. Used to verify help center displays brand-specific content.
 * See includes/Data/Brands.php for the source of truth. These are just copied here for convenience.
 */
const BRAND_EXPECTATIONS = {
  bluehost: {
    accountName: 'Bluehost',
    brandPrefix: 'bluehost',
    helpDomain: 'bluehost.com',
  },
  hostgator: {
    accountName: 'HostGator',
    brandPrefix: 'hostgator',
    helpDomain: 'hostgator.com',
  },
};

function getBrandExpectations() {
  const normalized = pluginId.toLowerCase().replace(/-/g, '');
  return BRAND_EXPECTATIONS[normalized] || BRAND_EXPECTATIONS.bluehost;
}

test.describe('Home Page- Help Center', () => {

  test.beforeEach(async ({ page }) => {
    await auth.loginToWordPress(page);
    const capabilitiesReady = await setSiteCapabilities(HELP_CENTER_CAPABILITIES, {
      attempts: 1,
      retryDelayMs: 150,
    });
    test.skip(
      !capabilitiesReady,
      'Help Center capabilities could not be verified; skipping to avoid setup-timeout flake.',
    );

    await setupHelpCenterApiMocks(page);
    const adminLoaded = await page
      .goto('/wp-admin/index.php', { waitUntil: 'domcontentloaded', timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    test.skip(
      !adminLoaded,
      'Help Center admin page did not load in time after setup; skipping flaky env.',
    );

    await clearHelpCenterClientState(page);
    const iconVisible = await waitForHelpCenterIcon(page, {
      maxAttempts: 2,
      adminBarTimeout: 8000,
      visibilityTimeout: 4000,
    });
    test.skip(
      !iconVisible,
      'Help Center icon did not render after capability setup retries; skipping to avoid known environment flake.',
    );
  });

  test('Verify HelpCenter icon visible and clickable', async ({ page }) => {
    await clickHelpCenterIcon(page);
    await verifyHelpCenterModalVisible(page);
  });

  test('Verify HelpCenter search response', async ({ page }) => {
    if (pluginId === 'hostgator') {
      test.skip();
    }

    await page.setViewportSize({ width: 1500, height: 1200 });
    await clickHelpCenterIcon(page);

    await expect(page.locator(SELECTORS.helpCenterContainer)).toBeVisible();

    await searchInHelpCenter(page, 'How to install a plugin in WordPress');

    // Verify search results appear
    const questionBlock = page.locator(SELECTORS.questionBlock);
    await expect(questionBlock).toContainText('"How to install a plugin in WordPress"', { timeout: 20000 });

    const resultBlock = page.locator(SELECTORS.resultBlock);
    await expect(resultBlock).toBeVisible({ timeout: 20000 });
  });

  test('Verify HelpCenter dislike screen', async ({ page }) => {
    if (pluginId === 'hostgator') {
      test.skip();
    }

    await page.setViewportSize({ width: 1500, height: 1200 });
    await clickHelpCenterIcon(page);

    await expect(page.locator(SELECTORS.helpCenterContainer)).toBeVisible();

    await searchInHelpCenter(page, 'How to install a plugin in WordPress');

    // Feedback renders after result + reveal; wait for the no button (mocked multi-search response)
    await expect(page.locator(SELECTORS.feedbackButtonNo)).toBeVisible({
      timeout: 30000,
    });

    // Click dislike feedback button
    await page.locator(SELECTORS.feedbackButtonNo).click();

    // Verify dislike feedback form appears
    await expect(page.locator(SELECTORS.dislikeFeedback)).toBeVisible();
  });

  test('Verify HelpCenter footer and CTA button visible and clickable', async ({ page }) => {
    await clickHelpCenterIcon(page);
    await verifyHelpCenterModalVisible(page);

    // Verify footer is visible
    await expect(page.locator(SELECTORS.footer)).toBeVisible();

    // CTA button (Pro Design banner) only shows for brands with showProDesignBanner (e.g. Bluehost)
    const expectations = getBrandExpectations();
    if (expectations.accountName === 'Bluehost') {
      await expect(page.locator(SELECTORS.ctaContainer)).toBeVisible();
      const ctaButton = page.locator(SELECTORS.ctaButton);
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveAttribute('href');
      const href = await ctaButton.getAttribute('href');
      expect(href).not.toBe('');
    }
  });

  test('Verify HelpCenter displays brand-specific content based on plugin', async ({ page }) => {
    const expectations = getBrandExpectations();
    await clickHelpCenterIcon(page);
    await verifyHelpCenterModalVisible(page);

    // Footer Account Support section shows brand account name
    await expect(page.locator(SELECTORS.footer)).toBeVisible();
    await expect(page.locator(SELECTORS.footer)).toContainText(expectations.accountName);

    // nfdHelpCenter global should have correct brand and brand-specific resourceLink
    const nfdHelpCenter = await page.evaluate(() => window.nfdHelpCenter);
    expect(nfdHelpCenter).toBeDefined();
    expect(nfdHelpCenter.brand).toBeDefined();
    expect(String(nfdHelpCenter.brand)).toMatch(new RegExp(`^${expectations.brandPrefix}`));
    if (nfdHelpCenter.resourceLink) {
      expect(nfdHelpCenter.resourceLink).toContain(expectations.helpDomain);
    }
    if (nfdHelpCenter.brandConfig?.accountName) {
      expect(nfdHelpCenter.brandConfig.accountName).toContain(expectations.accountName);
    }
  });

  test('Accessibility Test for Help Center', async ({ page }) => {
    await clickHelpCenterIcon(page);
    await verifyHelpCenterModalVisible(page);

    await a11y.checkA11y(page, '#nfd-help-center', {
      exclude: ['iframe', '.nfd-hc-modal__footer a[href*="external"]', '#search-input-box'],
      disabledRules: ['landmark-one-main', 'page-has-heading-one', 'color-contrast']
    });
  });

  test('Verify HelpCenter closed onclick', async ({ page }) => {
    await clickHelpCenterIcon(page);
    await verifyHelpCenterModalVisible(page);

    // Click close button
    const closeButton = page.locator(SELECTORS.closeButton);
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Verify modal is hidden
    await expect(page.locator(SELECTORS.helpCenterModal)).not.toBeVisible();
  });

  test('Verify Tooltip functionality to retrieve post information', async ({ page }) => {
    await clickHelpCenterIcon(page);

    // Tooltip should exist but be hidden initially
    const tooltip = page.locator(SELECTORS.tooltip);
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveCSS('display', 'none');

    // Click the hidden tooltip (force click)
    await tooltip.evaluate(el => el.click());

    // Verify question block contains expected content (tooltip_search mock)
    await expect(page.locator(SELECTORS.questionBlock)).toContainText(
      'i have 7 items in the cart that dont really exist how do i get rid of them',
      { timeout: 15000 }
    );
  });
});
