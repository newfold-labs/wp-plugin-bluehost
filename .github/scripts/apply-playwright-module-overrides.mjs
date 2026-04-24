import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, isAbsolute, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { getLocalModules } from './generate-playwright-projects.mjs';

const SPEC_PATTERN = /\.spec\.(mjs|js)$/;
const OVERRIDES_SUBDIR = join('tests', 'playwright', 'module-overrides');

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkFilePaths(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkFilePaths(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

/**
 * Resolve a module install root (from composer.local: local path, or vendor) for a wp-module name.
 * Local modules from composer.local take precedence over vendor (same as generate-playwright-projects).
 * @param {string} pluginRoot
 * @param {string} moduleName e.g. wp-module-next-steps
 * @param {Map<string, string>} localByName
 */
function getModuleTargetRoot(pluginRoot, moduleName, localByName) {
  if (localByName.has(moduleName)) {
    const p = localByName.get(moduleName);
    return isAbsolute(p) ? p : resolve(pluginRoot, p);
  }
  return join(pluginRoot, 'vendor', 'newfold-labs', moduleName);
}

/**
 * @param {string} dirName e.g. wp-module-ecommerce (same as `vendor/newfold-labs/<name>`)
 * @returns {string|null} module name, or null if not a module override folder
 */
function getModuleNameFromOverrideDir(dirName) {
  if (!dirName.startsWith('wp-module-') || dirName.length <= 'wp-module-'.length) {
    return null;
  }
  return dirName;
}

/**
 * Copy plugin test overrides into the installed module tree so imports (e.g. ../helpers) stay valid.
 * See tests/playwright/module-overrides/readme.md
 * @param {string} [pluginRoot] - use __dirname for correct paths when the config is loaded; defaults to process.cwd() when run as a CLI
 */
export function applyPlaywrightModuleOverrides(pluginRoot = process.cwd()) {
  const overridesBase = join(pluginRoot, OVERRIDES_SUBDIR);
  if (!existsSync(overridesBase)) {
    return;
  }

  const locals = getLocalModules();
  const localByName = new Map(locals.map((m) => [m.name, m.path]));
  let applied = 0;

  for (const ent of readdirSync(overridesBase, { withFileTypes: true })) {
    if (!ent.isDirectory()) {
      continue;
    }
    const moduleName = getModuleNameFromOverrideDir(ent.name);
    if (!moduleName) {
      continue;
    }
    const moduleOverrideRoot = join(overridesBase, ent.name);
    const targetRoot = getModuleTargetRoot(pluginRoot, moduleName, localByName);
    if (!existsSync(targetRoot)) {
      console.warn(
        `[playwright module-overrides] Skipping ${ent.name} (${moduleName}): not installed (expected at ${targetRoot})`
      );
      continue;
    }
    for (const src of walkFilePaths(moduleOverrideRoot)) {
      if (!SPEC_PATTERN.test(src)) {
        continue;
      }
      const relInSpecs = relative(moduleOverrideRoot, src);
      const dest = join(
        targetRoot,
        'tests',
        'playwright',
        'specs',
        relInSpecs
      );
      const destDir = dirname(dest);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      copyFileSync(src, dest);
      console.warn(
        `[module playwright test spec overridden] ${ent.name}: ${relInSpecs} -> ${dest}`
      );
      applied += 1;
    }
  }
  if (applied > 0) {
    console.warn(
      `[playwright module-overrides] ${applied} file(s) applied. Revert in the module repo and remove overrides when done; do not release with long-lived overrides.`
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  applyPlaywrightModuleOverrides();
}
