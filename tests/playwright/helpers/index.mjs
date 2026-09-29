// Native ESM entry for vendor modules that load PLUGIN_DIR/tests/playwright/helpers/index.mjs
// via pathToFileURL(). Do not dynamic-import index.js here: without "type":"module" in
// package.json, Node loads .js as script/CJS and throws on ESM import syntax. Playwright
// only transforms helpers when loaded through its test graph or createRequire (see index.js).
import { createRequire } from 'module';
import { join } from 'path';

const pluginDir = process.env.PLUGIN_DIR || process.cwd();
const requireFromPlugin = createRequire(join(pluginDir, 'package.json'));
const raw = requireFromPlugin('./tests/playwright/helpers/index.js');
const helpers = raw?.auth !== undefined ? raw : raw?.default;

export const auth = helpers.auth;
export const wordpress = helpers.wordpress;
export const newfold = helpers.newfold;
export const a11y = helpers.a11y;
export const utils = helpers.utils;
