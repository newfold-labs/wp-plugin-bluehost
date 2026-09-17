// Native ESM shim for vendor modules that load this file via pathToFileURL().
// Re-exports the same named exports that index.js exposes to Playwright spec files.
export { auth, wordpress, newfold, a11y, utils } from './index.js';
