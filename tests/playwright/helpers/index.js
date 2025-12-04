/**
 * Playwright Test Helpers
 * 
 * Centralized helper functions for WordPress e2e tests.
 * Import specific helpers as needed to avoid bloating test files.
 */

// Authentication helpers
import auth from './auth';

// Core WordPress functionality
import wordpress from './wordpress';

// Newfold/Bluehost plugin-specific helpers
import newfold from './newfold';

// Accessibility testing helpers
import a11y from './a11y';

// General test utilities
import utils from './utils';

export {
  auth,
  wordpress,
  newfold,
  a11y,
  utils
};
