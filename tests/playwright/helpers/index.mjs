// Native ESM shim for vendor modules that load this file via pathToFileURL().
// Static re-exports from './index.js' fail because Playwright compiles .js files
// as CJS; CJS named exports are not available at ESM static link time.
// Dynamic import resolves at evaluation time, after the CJS module runs, so
// named exports on module.exports are accessible.
const m = await import('./index.js');
const helpers = m.auth !== undefined ? m : m.default;
export const auth = helpers.auth;
export const wordpress = helpers.wordpress;
export const newfold = helpers.newfold;
export const a11y = helpers.a11y;
export const utils = helpers.utils;
