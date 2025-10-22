/**
 * Playwright Test Helpers
 * 
 * Centralized helper functions for WordPress e2e tests.
 * Import specific helpers as needed to avoid bloating test files.
 */

// Authentication helpers
const auth = require('./auth');

// Core WordPress functionality
const wordpress = require('./wordpress');

// Newfold/Bluehost plugin-specific helpers
const newfold = require('./newfold');

// Accessibility testing helpers
const a11y = require('./a11y');

// General test utilities
const utils = require('./utils');

// Setup helpers
const setup = require('./setup');

module.exports = {
  auth,
  wordpress,
  newfold,
  a11y,
  utils,
  setup,
};
