/**
 * Newfold/Bluehost Plugin-Specific Test Helpers
 * 
 * Utilities for testing Newfold Labs modules and Bluehost-specific functionality.
 * Includes capabilities, coming soon, dashboard widgets, and plugin-specific features.
 */

const { expect } = require('@playwright/test');
const wordpress = require('./wordpress');

/**
 * Set plugin capabilities (Bluehost-specific functionality)
 * 
 * @param {Object} capabilities - Capabilities object
 * @param {number} expiration - Expiration time in seconds (default: 3600)
 * @returns {Promise<void>}
 */
async function setCapability(capabilitiesJSON, expiration = 3600) {
  console.log('Setting capabilities', capabilitiesJSON);
  const expiry = Math.floor( new Date().getTime() / 1000.0 ) + expiration;
  
  // Use Promise.all to ensure both operations complete before returning
  await Promise.all([
    wordpress.wpCli(`option update _transient_nfd_site_capabilities '${ JSON.stringify(
      capabilitiesJSON
    ) }' --format=json`),
    wordpress.wpCli(`option update _transient_timeout_nfd_site_capabilities ${ expiry }`)
  ]);
}

/**
 * Clear all plugin capabilities
 */
async function clearCapabilities() {
  // Clear all capability options
  return await wordpress.wpCli('option delete _transient_nfd_site_capabilities');
}

/**
 * Log the current capabilities option from the database
 * 
 * @returns {Promise<string>} The current capabilities value
 */
async function logCapabilities() {
  console.log('Fetching current capabilities from database...');
  const result = await wordpress.wpCli('option get _transient_nfd_site_capabilities');
  console.log('Current capabilities:', result);
  return result;
}

/**
 * Check if coming soon is enabled
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if coming soon is enabled
 */
async function isComingSoonEnabled(page) {
  const response = await page.request.get('/wp-json/wp/v2/options/nfd_coming_soon');
  if (response.ok()) {
    const data = await response.json();
    return data === '1' || data === true;
  }
  return false;
}

/**
 * Enable or disable coming soon mode
 * 
 * @param {boolean} enabled - Whether to enable coming soon
 */
async function setComingSoon(enabled) {
return await wordpress.setOption('nfd_coming_soon', enabled);
}

/**
 * Click coming soon toggle button
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} enable - Whether to enable (true) or disable (false) coming soon
 */
async function toggleComingSoon(page, enable = true) {
  const buttonSelector = enable 
    ? '[data-cy="nfd-coming-soon-enable"]' 
    : '[data-cy="nfd-coming-soon-disable"]';
  
  const button = page.locator(buttonSelector);
  await button.click();
  
  // Wait for the toggle to take effect
  await page.waitForTimeout(1000);
}

/**
 * Verify coming soon status in site preview widget
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} expectedEnabled - Expected coming soon status
 */
async function verifyComingSoonStatus(page, expectedEnabled) {
  const statusText = expectedEnabled ? 'Not Live' : 'Live';
  const bodyText = expectedEnabled ? 'Coming Soon' : 'website is live';
  const dataAttribute = expectedEnabled ? 'true' : 'false';
  
  // Check status text
  await expect(page.locator('.iframe-preview-status')).toContainText(statusText);
  
  // Check body text
  await expect(page.locator('.site-preview-widget-body')).toContainText(bodyText);
  
  // Check data attribute
  await expect(page.locator('.site-preview-widget-body')).toHaveAttribute('data-coming-soon', dataAttribute);
}

/**
 * Verify widget link attributes
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} linkSelector - CSS selector for the link
 * @param {string} expectedText - Expected link text
 * @param {string|RegExp} expectedHref - Expected href pattern
 * @param {Object} expectedAttributes - Expected attributes (optional)
 */
async function verifyWidgetLink(page, linkSelector, expectedText, expectedHref, expectedAttributes = {}) {
  const link = page.locator(linkSelector);
  
  // Check text content
  await expect(link).toContainText(expectedText);
  
  // Check href
  const href = await link.getAttribute('href');
  if (typeof expectedHref === 'string') {
    expect(href).toContain(expectedHref);
  } else {
    expect(href).toMatch(expectedHref);
  }
  
  // Check additional attributes
  for (const [attr, value] of Object.entries(expectedAttributes)) {
    await expect(link).toHaveAttribute(attr, value);
  }
}

/**
 * Wait for dashboard widgets to load
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
async function waitForDashboardWidgets(page, timeout = 10000) {
  await page.waitForSelector('#dashboard-widgets-wrap', { timeout });
}

/**
 * Navigate to a specific plugin page in the WordPress admin.
 * Assumes the plugin ID is known.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object.
 * @param {string} pluginId - The ID of the plugin (e.g., 'bluehost').
 * @param {string} path - The path within the plugin (e.g., '#/home').
 */
async function navigateToPluginPage(page, pluginId, path = '') {
  await page.goto(`/wp-admin/admin.php?page=${pluginId}${path}`);
  await waitForWordPressAdmin(page);
}

/**
 * Wait for WordPress admin to be ready (helper function)
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function waitForWordPressAdmin(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#wpadminbar'); // Wait for admin bar to be visible
}

/**
 * Get admin menu items
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array<string>>} List of admin menu item texts
 */
async function getAdminMenuItems(page) {
  return await page.$$eval('#adminmenu > li > a .wp-menu-text', (elements) =>
    elements.map((el) => el.textContent.trim())
  );
}

/**
 * Wait for WordPress REST API to be available
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function waitForRestAPI(page) {
  // Try to access a simple REST endpoint
  const response = await page.request.get('/wp-json/wp/v2/users/me');
  if (!response.ok()) {
    throw new Error('WordPress REST API not available');
  }
}

module.exports = {
  // Capabilities
  setCapability,
  clearCapabilities,
  logCapabilities,
  
  // Coming Soon
  isComingSoonEnabled,
  setComingSoon,
  toggleComingSoon,
  verifyComingSoonStatus,
  
  // Dashboard Widgets
  verifyWidgetLink,
  waitForDashboardWidgets,
  
  // Plugin Navigation
  navigateToPluginPage,
  
  // WordPress Admin
  waitForWordPressAdmin,
  getAdminMenuItems,
  waitForRestAPI,
};
