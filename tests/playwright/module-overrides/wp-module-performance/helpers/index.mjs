/**
 * Performance Module Test Helpers for Playwright
 * 
 * - Plugin Helpers (re-exported)
 * - Constants (hashes, selectors)
 * - Navigation Helpers
 * - WP-CLI / Capability Helpers
 * - Assertion Helpers
 * - UI Interaction Helpers
 */
import { expect } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// PLUGIN HELPERS (re-exported from plugin-level helpers)
// ============================================================================

const pluginDir = process.env.PLUGIN_DIR || process.cwd();
const finalHelpersPath = join(pluginDir, 'tests/playwright/helpers/index.mjs');
const helpersUrl = pathToFileURL(finalHelpersPath).href;
const pluginHelpers = await import(helpersUrl);

export const { auth, wordpress, newfold, a11y, utils } = pluginHelpers;

// ============================================================================
// CONSTANTS
// ============================================================================

/** Plugin ID from environment */
export const pluginId = process.env.PLUGIN_ID || 'bluehost';

/** Cloudflare feature hashes for .htaccess rule identification */
export const CLOUDFLARE_HASHES = {
  fonts: '04d3b602',
  mirage: '63a6825d',
  polish: '27cab0f2',
};

/** Common selectors used across performance tests */
export const SELECTORS = {
  // Page container
  performancePage: '#nfd-performance',
  
  // Cache settings
  cacheSettings: '.newfold-cache-settings',
  clearCache: '.newfold-clear-cache',
  clearCacheButton: '.clear-cache-button',
  cacheLevelOff: 'input[type="radio"]#cache-level-0',
  cacheLevelOn: 'input[type="radio"]#cache-level-1',
  
  // Link Prefetch
  linkPrefetchSettings: '[data-cy="link-prefetch-settings"]',
  linkPrefetchBehaviorDropdown: '[data-cy="link-prefetch-behavior-desktop"] .nfd-select__button-label',
  linkPrefetchDropdownOptions: '[data-cy="link-prefetch-behavior-desktop"] .nfd-select__options > .nfd-select__option',
  linkPrefetchDesktopToggle: '[data-cy="link-prefetch-active-desktop-toggle"]',
  
  // Cloudflare toggles
  cloudflareFontsToggle: '[data-id="cloudflare-fonts"]',
  cloudflareMirageToggle: '[data-id="cloudflare-mirage"]',
  cloudflarePolishToggle: '[data-id="cloudflare-polish"]',
  
  // Notifications
  notifications: '.nfd-notifications',
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Navigate to performance page
 * Force reload ensures capabilities set via WP-CLI are picked up by the React app
 * @param {import('@playwright/test').Page} page
 */
export async function navigateToPerformancePage(page) {
  await page.goto(`/wp-admin/admin.php?page=${pluginId}#/settings/performance`);
  await page.reload();
}

/**
 * Wait for performance page to be ready
 * @param {import('@playwright/test').Page} page
 */
export async function waitForPerformancePage(page) {
  await page.waitForSelector( SELECTORS.performancePage, { timeout: 15000 } );
}

/**
 * Combined setup: login, navigate to performance page, and wait for it to load
 * @param {import('@playwright/test').Page} page
 */
export async function setupAndNavigate(page) {
  await auth.loginToWordPress(page);
  await navigateToPerformancePage(page);
  await waitForPerformancePage(page);
}

// ============================================================================
// WP-CLI / CAPABILITY HELPERS
// ============================================================================

/**
 * Set site capabilities transient using PHP eval
 * @param {Object} capabilities - Object with capability key-value pairs
 * @example setSiteCapabilities({ hasCloudflareFonts: true, hasLinkPrefetchClick: true })
 */
export async function setSiteCapabilities(capabilities) {
  const phpArray = Object.entries(capabilities)
    .map(([key, value]) => {
      const phpValue = typeof value === 'boolean' ? value.toString() : `'${value}'`;
      return `'${key}' => ${phpValue}`;
    })
    .join(', ');

  const command = `eval "set_transient('nfd_site_capabilities', array(${phpArray}));"`;
  await wordpress.wpCli(command, { failOnNonZeroExit: false });
}

/**
 * Set link prefetch capabilities (alias for semantic clarity)
 * @param {Object} capabilities - e.g., { hasLinkPrefetchClick: true, hasLinkPrefetchHover: false }
 */
export const setLinkPrefetchCapabilities = setSiteCapabilities;

/**
 * Clear site capabilities transient
 */
export async function clearSiteCapabilities() {
  await wordpress.wpCli('transient delete nfd_site_capabilities', {
    failOnNonZeroExit: false,
  });
  await wordpress.wpCli('option delete _transient_nfd_site_capabilities', {
    failOnNonZeroExit: false,
  });
  await wordpress.wpCli('option delete _transient_timeout_nfd_site_capabilities', {
    failOnNonZeroExit: false,
  });
}

/**
 * Clear font optimization option
 */
export async function clearFontOptimizationOption() {
  await wordpress.wpCli('option delete nfd_fonts_optimization', { failOnNonZeroExit: false });
}

/**
 * Clear image optimization option (used by Mirage and Polish)
 */
export async function clearImageOptimizationOption() {
  await wordpress.wpCli('option delete nfd_image_optimization', { failOnNonZeroExit: false });
}

/**
 * Set link prefetch settings
 * @param {Object} settings - e.g., { activeOnDesktop: true, behavior: 'mouseDown' }
 */
export async function setLinkPrefetchSettings(settings) {
  const jsonSettings = JSON.stringify(settings).replace(/"/g, '\\"');
  await wordpress.wpCli(`option update nfd_link_prefetch_settings '${jsonSettings}' --format=json`, { failOnNonZeroExit: false });
}

/**
 * Read .htaccess file content via CLI
 * @returns {Promise<string>} .htaccess file content
 */
export async function readHtaccess() {
  try {
    const output = execSync('npx wp-env run cli cat .htaccess', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    });
    return output || '';
  } catch (error) {
    console.log('Error reading .htaccess:', error.message);
    return '';
  }
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that .htaccess contains the expected Cloudflare optimization rule
 * Includes retry logic since .htaccess may be written asynchronously
 * @param {string} hash - The hash identifier for the rule (use CLOUDFLARE_HASHES)
 * @param {number} retries - Number of retry attempts (default: 3)
 */
export async function assertHtaccessHasRule(hash, retries = 8) {
  let htaccess = '';

  for (let i = 0; i < retries; i++) {
    htaccess = await readHtaccess();
    if (
      htaccess.includes(hash) &&
      htaccess.includes('# BEGIN Newfold CF Optimization Header')
    ) {
      expect(htaccess).toContain('# BEGIN Newfold CF Optimization Header');
      expect(htaccess).toContain('# END Newfold CF Optimization Header');
      expect(htaccess).toContain('nfd-enable-cf-opt');
      expect(htaccess).toContain(hash);
      expect(htaccess).toContain('Set-Cookie "nfd-enable-cf-opt=');
      return;
    }
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  expect(htaccess).toContain(hash);
}

/**
 * Assert that .htaccess does NOT contain the expected rule (retries: rules are removed async).
 * @param {string} hash - The hash identifier for the rule (use CLOUDFLARE_HASHES)
 * @param {number} retries
 */
export async function assertHtaccessHasNoRule(hash, retries = 8) {
  for (let i = 0; i < retries; i++) {
    const htaccess = await readHtaccess();
    if (!htaccess.includes(hash)) {
      return;
    }
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  const htaccess = await readHtaccess();
  expect(htaccess).not.toContain(hash);
}

/**
 * Assert that a notification with specific text is visible
 * @param {import('@playwright/test').Page} page
 * @param {string} text - Text to expect in the notification
 */
export async function expectNotification(page, text) {
  await expect(
    page.locator(SELECTORS.notifications).filter({ hasText: text })
  ).toContainText(text);
}

// ============================================================================
// UI INTERACTION HELPERS
// ============================================================================

/**
 * Get Cloudflare toggle locator by type
 * @param {import('@playwright/test').Page} page
 * @param {'fonts' | 'mirage' | 'polish'} type - Toggle type
 * @returns {import('@playwright/test').Locator}
 */
export function getCloudflareToggle(page, type) {
  const selectors = {
    fonts: SELECTORS.cloudflareFontsToggle,
    mirage: SELECTORS.cloudflareMirageToggle,
    polish: SELECTORS.cloudflarePolishToggle,
  };
  return page.locator(selectors[type]);
}

/**
 * Verify Cloudflare toggle exists and has expected state
 * @param {import('@playwright/test').Page} page
 * @param {'fonts' | 'mirage' | 'polish'} type - Toggle type
 * @param {'true' | 'false'} expectedState - Expected aria-checked value
 */
export async function verifyCloudflareToggleState(page, type, expectedState) {
  const toggle = getCloudflareToggle(page, type);
  await expect(toggle).toBeVisible({ timeout: 20000 });
  await expect(toggle).toHaveAttribute('aria-checked', expectedState, {
    timeout: 20000,
  });
}

/**
 * Toggle a Cloudflare feature on or off. Avoids `networkidle` (unreliable in wp-admin);
 * relies on attribute assertion and a short delay for async .htaccess writes.
 * @param {import('@playwright/test').Page} page
 * @param {'fonts' | 'mirage' | 'polish'} type - Toggle type
 * @param {boolean} enable - Whether to enable (true) or disable (false)
 */
export async function setCloudflareToggle(page, type, enable) {
  const toggle = getCloudflareToggle(page, type);
  const currentState = await toggle.getAttribute('aria-checked');
  const wantEnabled = enable ? 'true' : 'false';

  if (currentState !== wantEnabled) {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-checked', wantEnabled, {
    timeout: 20000,
  });
  await page.waitForLoadState('load').catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 400));
}

/**
 * Verify Link Prefetch section is displayed
 * @param {import('@playwright/test').Page} page
 */
export async function verifyLinkPrefetchDisplayed(page) {
  const linkPrefetch = page.locator(SELECTORS.linkPrefetchSettings);
  await linkPrefetch.scrollIntoViewIfNeeded();
  await expect(linkPrefetch).toBeVisible();
}

/**
 * Ensure desktop toggle is enabled for link prefetch
 * @param {import('@playwright/test').Page} page
 */
export async function ensureLinkPrefetchToggleEnabled(page) {
  const toggle = page.locator(SELECTORS.linkPrefetchDesktopToggle);
  const isChecked = await toggle.getAttribute('aria-checked');
  if (isChecked === 'false') {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
}

/**
 * Check link prefetch capability dropdown options
 * @param {import('@playwright/test').Page} page
 * @param {'onlyMouseDown' | 'both'} type - Expected capability type
 */
export async function checkLinkPrefetchCapabilities(page, type) {
  const dropdown = page.locator(SELECTORS.linkPrefetchBehaviorDropdown);
  await dropdown.click();
  
  const options = page.locator(SELECTORS.linkPrefetchDropdownOptions);
  
  if (type === 'onlyMouseDown') {
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText('Prefetch on Mouse Down');
  } else {
    await expect(options).toHaveCount(2);
  }
  
  // Close dropdown by clicking elsewhere
  await page.locator(SELECTORS.performancePage).click();
}
