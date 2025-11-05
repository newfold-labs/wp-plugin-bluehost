const wordpress = require('./wordpress');
const auth = require('./auth');

/**
 * Run common setup tasks for all tests
 * 
 * @param {import('@playwright/test').Browser} browser - Playwright browser instance
 */
async function runCommonSetup(browser) {
  const page = await browser.newPage();
  try {
    // Navigate to WordPress dashboard
    await auth.navigateToAdminPage(page, 'index.php');
    // Set permalink structure
    await wordpress.setPermalinkStructure(page);
    console.log('Common setup completed');
  } finally {
    await page.close();
  }
}

module.exports = {
  runCommonSetup,
};
