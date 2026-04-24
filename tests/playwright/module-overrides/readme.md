# Module test overrides

Each Newfold `wp-module-*` package has its own repo and Playwright tests. A failure sometimes only shows up in a full plugin build. This directory is for **short-lived iteration** on a module spec: you edit a copy here, and the plugin copies it over the installed module’s `tests/playwright/specs` tree on each Playwright run, so you do not have to publish the module just to try a spec fix.

## How it works

- **When:** Overrides are applied when [playwright.config.mjs](../../../playwright.config.mjs) loads (e.g. every `npm run test:playwright` / `npx playwright test`).
- **Implementation:** [.github/scripts/apply-playwright-module-overrides.mjs](../../../.github/scripts/apply-playwright-module-overrides.mjs) copies `*.spec.mjs` / `*.spec.js` into the target module. Specs stay under that module’s tree so **relative imports** (e.g. `import … from '../helpers'`) still resolve the same as in the package.
- **Where files land:** For `vendor/…/wp-module-foo`, the destination is `vendor/newfold-labs/wp-module-foo/tests/playwright/specs/…`. If the same module is present via **`composer.local.json`** (path repository), the **local checkout wins** and receives the copy (same rules as the Playwright project generator). If the target module is not installed, the folder is skipped and a message is printed.

## Layout

- **Location:** `tests/playwright/module-overrides/` (this folder).
- **Folders:** One **top-level** directory per module, named **exactly** like the module directory, e.g. `wp-module-marketplace`. Names must start with `wp-module-` and be non-empty after that prefix. Only these directories are scanned; other files (e.g. this readme) are ignored.
- **Files:** Add or edit `*.spec.mjs` or `*.spec.js` inside the module’s folder. Optional **subfolders** are mirrored under `…/tests/playwright/specs/` in the target module (same relative paths as here).

## Example

Override `failing-test.spec.mjs` for the marketplace module:

1. Start from:  
   `vendor/newfold-labs/wp-module-marketplace/tests/playwright/specs/failing-test.spec.mjs`  
2. Work in:  
   `tests/playwright/module-overrides/wp-module-marketplace/failing-test.spec.mjs`

On the next test run, that file is copied over the installed spec path (vendor or your local `composer.path` for that module).

## Apply without running the full suite

From the **plugin root**:

```sh
node .github/scripts/apply-playwright-module-overrides.mjs
```

Uses the current working directory as the plugin root. To match config loading, run from the plugin root.

## Scope and risk

- Only `*.spec.{mjs,js}` files are copied; this is not for overriding application module code.
- `vendor` (or a local path checkout) will **show local diffs** if your repo tracks `vendor` / that path. Treat overrides as temporary: port changes into the real module, delete the file here, and do **not** tag a release with stale overrides in place. Playwright logs a **warning** for each file applied so CI makes overrides visible.

## After you’re done

1. Open a PR in the real module and merge the spec fix.  
2. Remove the override file (and the module folder if it’s empty) from this tree.  
3. Prefer not to merge or tag a **release** of the plugin while relying on unmerged overrides for correctness.
