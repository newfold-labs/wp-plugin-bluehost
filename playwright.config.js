// playwright.config.js
const { defineConfig } = require('@playwright/test');

// Read wp-env.json to get the correct port
const wpEnvConfig = require('./.wp-env.json');

module.exports = defineConfig({
  testMatch: [
    'tests/playwright/specs/**/*.spec.js',
    'vendor/newfold-labs/**/tests/e2e/specs/**/*.spec.js',
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
  webServer: {
    command: 'wp-env start',
    port: wpEnvConfig.port, // Use port from wp-env.json
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes
  },
  timeout: 30 * 1000, // 30 seconds
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 2,
  outputDir: 'tests/playwright/test-results',
});