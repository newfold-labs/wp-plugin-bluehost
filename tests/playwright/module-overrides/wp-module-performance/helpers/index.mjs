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
const { fancyLog } = utils;

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

const DEFAULT_CAPABILITY_RETRIES = 2;
const DEFAULT_CAPABILITY_RETRY_DELAY_MS = 200;
const DEFAULT_HTACCESS_REPAIR_RETRIES = 2;

const CLEAN_HTACCESS_TEMPLATE = `# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
`;

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
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.waitForLoadState('domcontentloaded');
    const isVisible = await page.locator(SELECTORS.performancePage).isVisible().catch(() => false);
    if (isVisible) {
      return true;
    }

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const currentUrl = page.url();
    if (
      bodyText.includes('Internal Server Error') ||
      currentUrl.includes('/wp-login.php') ||
      !currentUrl.includes(`/wp-admin/admin.php?page=${pluginId}`)
    ) {
      const repaired = await ensureHealthyHtaccess();
      if (!repaired.ok) {
        break;
      }
      await auth.loginToWordPress(page);
      await page.goto(`/wp-admin/admin.php?page=${pluginId}#/settings/performance`, {
        waitUntil: 'domcontentloaded',
      });
      continue;
    }

    await page.goto(`/wp-admin/admin.php?page=${pluginId}#/settings/performance`, {
      waitUntil: 'domcontentloaded',
    });
  }

  return false;
}

/**
 * Combined setup: login, navigate to performance page, and wait for it to load
 * @param {import('@playwright/test').Page} page
 */
export async function setupAndNavigate(page) {
  const htaccess = await ensureHealthyHtaccess();
  if (!htaccess.ok) {
    return htaccess;
  }
  await auth.loginToWordPress(page);
  await navigateToPerformancePage(page);
  const ready = await waitForPerformancePage(page);
  if (!ready) {
    return {
      ok: false,
      reason: 'Performance page did not become ready after recovery attempts.',
    };
  }
  return { ok: true, reason: '' };
}

function getWpLoginHttpStatusLine() {
  try {
    return execSync(
      `npx wp-env run wordpress php -r '$ctx=stream_context_create(["http"=>["ignore_errors"=>true]]); @file_get_contents("http://localhost/wp-login.php", false, $ctx); echo (string)($http_response_header[0] ?? "");'`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 15000,
      },
    ).trim();
  } catch {
    return '';
  }
}

function restoreBaseHtaccess() {
  const b64 = Buffer.from(CLEAN_HTACCESS_TEMPLATE, 'utf8').toString('base64');
  execSync(
    `npx wp-env run wordpress php -r "file_put_contents('/var/www/html/.htaccess', base64_decode('${b64}'));"`,
    {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000,
    },
  );
  execSync('npx wp-env run cli wp rewrite flush', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 15000,
  });
}

export async function ensureHealthyHtaccess(retries = DEFAULT_HTACCESS_REPAIR_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const status = getWpLoginHttpStatusLine();
    if (status.includes('200')) {
      return { ok: true, reason: '' };
    }

    fancyLog(
      `Detected unhealthy wp-login response (${status || 'no status'}) — restoring .htaccess baseline (${attempt}/${retries})`,
      100,
      'yellow',
    );
    try {
      restoreBaseHtaccess();
    } catch (error) {
      fancyLog(`.htaccess repair command failed: ${error?.message || error}`, 100, 'yellow');
    }
  }

  const finalStatus = getWpLoginHttpStatusLine();
  return {
    ok: false,
    reason: `wp-login remains unhealthy after .htaccess repair attempts (status: ${finalStatus || 'unknown'})`,
  };
}

function isWpCliError(output) {
  if (typeof output !== 'string') {
    return false;
  }
  return output.startsWith('Error:') || output.includes('Fatal error') || output.includes('Parse error');
}

async function runWpCli(command) {
  const raw = await wordpress.wpCli(command, { failOnNonZeroExit: false });
  const output = typeof raw === 'string' ? raw : String(raw ?? '');
  return {
    ok: !isWpCliError(output),
    output,
  };
}

function toPhpArray(capabilities) {
  return Object.entries(capabilities)
    .map(([key, value]) => {
      const phpValue = typeof value === 'boolean' ? value.toString() : `'${value}'`;
      return `'${key}' => ${phpValue}`;
    })
    .join(', ');
}

async function verifySiteCapabilities(expectedCapabilities) {
  const result = await runWpCli('option get _transient_nfd_site_capabilities --format=json');
  if (!result.ok) {
    return {
      ok: false,
      reason: `capability read failed: ${result.output}`,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(result.output);
  } catch {
    return {
      ok: false,
      reason: `capability read was not valid JSON: ${result.output}`,
    };
  }

  for (const [key, expected] of Object.entries(expectedCapabilities)) {
    if (parsed?.[key] !== expected) {
      return {
        ok: false,
        reason: `capability mismatch for ${key} (expected: ${String(expected)}, actual: ${String(parsed?.[key])})`,
      };
    }
  }

  return { ok: true, reason: '' };
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
  return setSiteCapabilitiesWithRetry(capabilities);
}

export async function setSiteCapabilitiesWithRetry(
  capabilities,
  retries = DEFAULT_CAPABILITY_RETRIES,
) {
  const phpArray = toPhpArray(capabilities);
  let lastReason = '';

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const setResult = await runWpCli(
      `eval "set_transient('nfd_site_capabilities', array(${phpArray}), 4 * HOUR_IN_SECONDS);"`,
    );
    if (!setResult.ok) {
      lastReason = setResult.output;
    } else {
      const verify = await verifySiteCapabilities(capabilities);
      if (verify.ok) {
        return { ok: true, reason: '' };
      }
      lastReason = verify.reason;
    }

    fancyLog(
      `Performance capability setup retry (${attempt}/${retries}): ${lastReason}`,
      100,
      'yellow',
    );
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, DEFAULT_CAPABILITY_RETRY_DELAY_MS));
    }
  }

  return {
    ok: false,
    reason: `Unable to verify nfd_site_capabilities after retries: ${lastReason}`,
  };
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
