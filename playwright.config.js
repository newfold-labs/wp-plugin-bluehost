// playwright.config.js
const { defineConfig } = require('@playwright/test');

// Read wp-env.json to get the correct port
const wpEnvConfig = require('./.wp-env.json');

module.exports = defineConfig({
  globalSetup: require.resolve('./tests/playwright/global-setup.js'),
  testMatch: [
    'tests/playwright/specs/**/*.spec.js',
  ],
  testIgnore: [
    // Don't ignore anything - we want to include gitignored files
    // Since we use the copy-vendor-tests.js script to copy the vendor tests 
    // to the tests/playwright/specs/vendor directory when running playwright tests,
    // we gitignore them, but playwright needs to find them so we override the default playwright ignore list here
  ],
  use: {
    baseURL: `http://localhost:${wpEnvConfig.port}`, // Use port from wp-env.json
    headless: true,
    viewport: { width: 1024, height: 768 },
    ignoreHTTPSErrors: true,
    // WordPress-optimized settings
    locale: 'en-US',
    contextOptions: {
      reducedMotion: 'reduce', // Accessibility testing
      strictSelectors: true,   // Better selector reliability
    },
    // Enable debugging features
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  webServer: process.env.CI ? undefined : {
    command: 'wp-env start',
    port: wpEnvConfig.port, // Use port from wp-env.json
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes
  },
  timeout: 30 * 1000, // 30 seconds
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 1 : 1,
  outputDir: 'tests/playwright/test-results',
});