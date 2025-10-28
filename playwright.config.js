// playwright.config.js
const { defineConfig } = require('@playwright/test');
const fs = require('fs');
const { writeProjectsFile } = require('./.github/scripts/generate-playwright-projects');

// Read wp-env.json to get the correct port
const wpEnvConfig = require('./.wp-env.json');

// Generate projects file if it doesn't exist or is stale
const projectsFile = 'playwright-projects.json';
if (!fs.existsSync(projectsFile)) {
  writeProjectsFile();
}

// Load projects from generated file
const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));

module.exports = defineConfig({
  globalSetup: require.resolve('./tests/playwright/global-setup.js'),
  projects: projects,
  testIgnore: [
    // Don't ignore anything - we want to include gitignored files that playwright needs to find
    // playwright needs to find vendor files, so we override the default playwright ignore list here
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