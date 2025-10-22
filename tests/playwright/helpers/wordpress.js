const { execSync } = require('child_process');

/**
 * Core WordPress Test Helpers
 * 
 * Utilities for core WordPress functionality: authentication, admin navigation,
 * permalinks, and basic WordPress operations.
 */

const { Admin, PageUtils } = require('@wordpress/e2e-test-utils-playwright');

/**
 * Wait for WordPress admin to be ready
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function waitForWordPressAdmin(page) {
  // Wait for WordPress admin bar or body class
  await page.waitForSelector('body.wp-admin', { timeout: 10000 });
  
  // Wait for admin menu to be visible
  await page.waitForSelector('#adminmenu', { timeout: 5000 });
}

/**
 * Check if user is logged into WordPress
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {boolean} True if logged in
 */
async function isLoggedIn(page) {
  try {
    await page.goto('/wp-admin/');
    await page.waitForSelector('body.wp-admin', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get WordPress admin menu items
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Array} Array of menu item objects
 */
async function getAdminMenuItems(page) {
  const menuItems = await page.locator('#adminmenu li').all();
  const items = [];
  
  for (const item of menuItems) {
    const text = await item.textContent();
    const href = await item.locator('a').getAttribute('href');
    items.push({ text: text?.trim(), href });
  }
  
  return items;
}

/**
 * Navigate to plugin page
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginSlug - Plugin slug (e.g., 'bluehost')
 * @param {string} subPage - Sub-page hash (e.g., '#/settings')
 */
async function navigateToPluginPage(page, pluginSlug, subPage = '') {
  const pageUtils = new PageUtils({ page });
  const admin = new Admin({ page, pageUtils });
  
  await admin.visitAdminPage(`admin.php?page=${pluginSlug}${subPage}`);
}

/**
 * Check if plugin is active
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pluginSlug - Plugin slug
 * @returns {boolean} True if plugin is active
 */
async function isPluginActive(page, pluginSlug) {
  const pageUtils = new PageUtils({ page });
  const admin = new Admin({ page, pageUtils });
  
  await admin.visitAdminPage('plugins.php');
  
  const pluginRow = page.locator(`tr[data-plugin*="${pluginSlug}"]`);
  const deactivateLink = pluginRow.locator('a[href*="deactivate"]');
  
  return await deactivateLink.isVisible();
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

/**
 * Execute WordPress CLI command
 * 
 * @param {string} command - WP-CLI command to execute
 * @returns {string|number} - Output string if available, 0 for success, or error info.
 */
async function wpCli(command) {
  console.log(`WP-CLI command: ${command}`);
  try {
    const output = execSync(`npx wp-env run cli wp ${command}`, {
      encoding: 'utf-8', // auto convert Buffer to string
      stdio: ['pipe', 'pipe', 'pipe'], // capture stdout/stderr
    });

    // If output is empty, just return 0 for success
    return output.trim() ? output.trim() : 0;
  } catch (err) {
    // err.status = exit code
    // err.stdout / err.stderr may have useful info
    if (err.stderr) {
      return `Error: ${err.stderr.toString().trim()}`;
    }
    return err.status || 1;
  }
}

/**
 * Set WordPress option via WP-CLI
 * 
 * @param {string} option - Option name
 * @param {string|boolean} value - Option value
 */
async function setOption(option, value) {
  console.log(`Setting WordPress option: ${option} = ${value}`);
  const command = `option update ${option} ${value}`;
  return await wpCli(command);
}

/**
 * Set WordPress permalink structure and flush rewrite rules
 * 
 * @param {string} structure - Permalink structure (default: '/%postname%/')
 */
async function setPermalinkStructure(page, structure = '/%postname%/') {
  console.log(`Setting permalink structure to: ${structure}`);

  // navigate to permalink settings
  const pageUtils = new PageUtils({ page });
  const admin = new Admin({ page, pageUtils });
  await admin.visitAdminPage(`options-permalink.php`, { waitUntil: 'domcontentloaded' });

  // set pemalink structure
  if ( structure === '/%postname%/' ) {
    await page.locator('#permalink-input-post-name').check();
  } else {
    await page.locator('#custom_selection').check();
    await page.locator('#permalink_structure').fill(structure);
  }
  // click submit
  await page.locator('#submit').click();
  // wait for success message to be visible
  return await page.locator('.notice-success').isVisible();
}

/**
 * Create WordPress utilities (Admin and PageUtils instances)
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Object} Object containing admin and pageUtils instances
 */
async function createWordPressUtils(page) {
  const pageUtils = new PageUtils({ page });
  const admin = new Admin({ page, pageUtils });
  return { admin, pageUtils };
}

module.exports = {
  // Core WordPress functionality
  waitForWordPressAdmin,
  isLoggedIn,
  getAdminMenuItems,
  waitForRestAPI,
  
  // Plugin management
  navigateToPluginPage,
  isPluginActive,
  
  // WordPress CLI and options
  wpCli,
  setOption,
  setPermalinkStructure,
  
  // WordPress utilities
  createWordPressUtils,
};