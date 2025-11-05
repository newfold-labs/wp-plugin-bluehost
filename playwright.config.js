// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const { writeProjectsFile } = require('./.github/scripts/generate-playwright-projects');
const { phpVersion, core } = require( './.wp-env.json' );
const wpVersion = /[^/]*$/.exec( core )[ 0 ];

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
process.env.WP_ADMIN_USERNAME = process.env.WP_ADMIN_USERNAME || 'admin';
process.env.WP_ADMIN_PASSWORD = process.env.WP_ADMIN_PASSWORD || 'password';
process.env.WP_VERSION = process.env.WP_VERSION || wpVersion;
process.env.PHP_VERSION = process.env.PHP_VERSION || phpVersion;

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
  workers: process.env.CI ? 1 : 1, // Use default (number of CPU cores) for local, 1 for CI
  outputDir: 'tests/playwright/test-results',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      pathTemplate: '{testDir}/screenshots{/projectName}/{testFilePath}/{arg}{ext}',
      fullPage: true,
    },
  },
  reporter: [
    ['list', { printSteps: true,  }],
    // ['json', {  outputFile: 'tests/playwright/reports/test-results.json' }],
    // ['html', { outputFolder: 'tests/playwright/reports/html' }],
    // ['@estruyf/github-actions-reporter'] // https://github.com/estruyf/playwright-github-actions-reporter
  ]
});