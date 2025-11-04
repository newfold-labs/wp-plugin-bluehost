/**
 * General Test Utilities
 * 
 * Common utilities for Playwright tests that aren't WordPress-specific.
 * Includes screenshots, retry logic, test data generation, and general helpers.
 */

/**
 * Wait for element to be visible and stable
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} timeout - Maximum time to wait in milliseconds
 */
async function waitForStable(locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
  // Additional check for stability, e.g., by waiting for a short period after visibility
  await locator.waitFor({ state: 'attached', timeout: 100 }); // Ensure it's attached to DOM
}

/**
 * Takes a screenshot with a timestamped filename.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object.
 * @param {string} name - Base name for the screenshot file.
 * @returns {Promise<string>} The filename of the saved screenshot.
 */
async function takeTimestampedScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `artifacts/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path: filename });
  return filename;
}

/**
 * Waits for the network to be idle.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object.
 * @param {number} timeout - Maximum time to wait for network idle in milliseconds.
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Retries a function with exponential backoff.
 *
 * @param {Function} fn - The function to retry.
 * @param {number} retries - Number of retries.
 * @param {number} delay - Initial delay in milliseconds.
 * @returns {Promise<any>} The result of the function.
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

/**
 * Generates unique test data.
 *
 * @param {string} prefix - Prefix for the generated data.
 * @returns {{name: string, email: string, username: string}} Generated test data.
 */
function generateTestData(prefix = 'test') {
  const random = Math.random().toString(36).substring(7);
  return {
    name: `${prefix}-${random}`,
    email: `test-${random}@example.com`,
    username: `${prefix}_${random}`,
  };
}

/**
 * Clean up test data
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Array} cleanupTasks - Array of cleanup functions
 */
async function cleanupTestData(page, cleanupTasks = []) {
  for (const task of cleanupTasks) {
    try {
      await task(page);
    } catch (error) {
      console.warn('Cleanup task failed:', error.message);
    }
  }
}

/**
 * Scroll element into view and wait for it to be stable
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {Object} options - Scroll options
 */
async function scrollIntoView(locator, options = {}) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await locator.waitFor({ state: 'attached', timeout: 100 }); // Wait for stability
}

/**
 * Wait for notification to appear and contain specific text
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to look for in notification
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
async function waitForNotification(page, text, timeout = 5000) {
  const notification = page.locator('.nfd-notifications').filter({ hasText: text });
  await notification.waitFor({ state: 'visible', timeout });
  return notification;
}

/**
 * Wait for element to be visible with custom timeout
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
async function waitForVisible(locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
}

/**
 * Wait for element to be hidden
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
async function waitForHidden(locator, timeout = 5000) {
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * Get element text content safely
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @returns {Promise<string>} Element text content or empty string
 */
async function getTextContent(locator) {
  try {
    return await locator.textContent() || '';
  } catch {
    return '';
  }
}

/**
 * Check if element exists without throwing
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @returns {Promise<boolean>} True if element exists
 */
async function elementExists(locator) {
  try {
    return await locator.count() > 0;
  } catch {
    return false;
  }
}

/**
 * Wait for page to be fully loaded
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
async function waitForPageLoad(page, timeout = 10000) {
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Generate random string for testing
 * 
 * @param {number} length - Length of random string (default: 8)
 * @returns {string} Random string
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date for testing
 * 
 * @param {Date} date - Date to format (default: current date)
 * @returns {string} Formatted date string
 */
function formatTestDate(date = new Date()) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

module.exports = {
  // Element interaction
  waitForStable,
  waitForVisible,
  waitForHidden,
  scrollIntoView,
  getTextContent,
  elementExists,
  
  // Screenshots and media
  takeTimestampedScreenshot,
  
  // Network and loading
  waitForNetworkIdle,
  waitForPageLoad,
  
  // Retry and error handling
  retryWithBackoff,
  
  // Test data generation
  generateTestData,
  generateRandomString,
  formatTestDate,
  
  // Cleanup
  cleanupTestData,
  
  // Notifications
  waitForNotification,
};