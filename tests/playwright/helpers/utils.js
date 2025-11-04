/**
 * General Test Utilities
 * 
 * Common utilities for Playwright tests that aren't WordPress-specific.
 */

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

module.exports = {
  // Scroll into view
  scrollIntoView,
  
  // Notifications
  waitForNotification,
};