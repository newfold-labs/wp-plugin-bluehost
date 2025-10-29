// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const { writeProjectsFile } = require('./.github/scripts/generate-playwright-projects');

// Read wp-env.json to get the correct port
const wpEnvConfig = require('./.wp-env.json');

// Generate projects file if it doesn't exist or is stale
const projectsFile = './tests/playwright/playwright-projects.json';
if (!fs.existsSync(projectsFile)) {
  writeProjectsFile();
}

// Load projects from generated file
const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));

// Set environment variable for plugin root
process.env.PLUGIN_DIR = __dirname;
process.env.PLUGIN_ID = 'bluehost'

module.exports = defineConfig({
  globalSetup: require.resolve('./tests/playwright/global-setup.js'),
  projects: projects,
  testIgnore: [
    // Don't ignore anything - we want to include gitignored files that playwright needs to find
    // playwright needs to find vendor files, so we override the default playwright ignore list here
  ],
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    viewport: { width: 1200, height: 800 },
    baseURL: `http://localhost:${wpEnvConfig.port}`, // Use port from wp-env.json
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
  workers: process.env.CI ? 1 : undefined, // Use default (number of CPU cores) for local, 1 for CI
  outputDir: 'tests/playwright/test-results',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      pathTemplate: '{testDir}/screenshots{/projectName}/{testFilePath}/{arg}{ext}',
      fullPage: true,
    },
  }
});