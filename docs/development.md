# Development workflow

## Linting and code style

**JavaScript**

```bash
npm run lint:js          # Lint only
npm run lint:js:fix      # Lint and fix
npm run lint:css         # Lint CSS
npm run lint:yml         # Lint YAML (e.g. workflows)
```

**PHP**

```bash
composer run lint        # PHPCS
composer run fix         # PHPCS with auto-fix (phpcbf)
```

Lint the repo before pushing; CI may run the same checks.

## Testing

- **E2E:** Playwright (replaces Cypress in scripts). Run with:

  ```bash
  npm run test:e2e
  # or
  npm run test:playwright
  ```

  Config and project ID are in the repo (e.g. `playwright.config.*` or similar). E2E tests may live under `tests/` and can include module tests from vendor.

- **Unit (JS):**

  ```bash
  npm run test:unit
  ```

  Uses wp-scripts test runner (e.g. Jest).

- **Interactive E2E:** Run Cypress interactively with `npm run cypress` (if available), or use the Playwright UI when you need to run or debug a single test.

## Internationalization (i18n)

- **POT/PO/MO/JSON:** Composer and npm both expose i18n commands. Typical flow:

  ```bash
  composer run i18n        # Full i18n pipeline (or use npm run i18n)
  composer run i18n-pot    # POT only
  composer run i18n-po     # Update PO from POT
  composer run i18n-mo     # Compile MO
  composer run i18n-json   # Generate JSON for JS
  ```

  Text domain: **`wp-plugin-bluehost`**. Language files usually live under `languages/`.

- **CI:** Scripts like `i18n-ci-pre` and `i18n-ci-post` may be used in CI to validate or update translations.

## Version management

The plugin version must stay in sync in **three places**:

1. Plugin header **Version** in `bluehost-wordpress-plugin.php`.
2. Constant **`BLUEHOST_PLUGIN_VERSION`** in `bluehost-wordpress-plugin.php`.
3. **`version`** in `package.json`.

Use the version-bump script to update all three and rebuild:

```bash
npm run set-version-bump    # Patch bump (e.g. 4.14.1 → 4.14.2)
npm run set-version-minor   # Minor bump
```

After bumping, the script runs install, clears `build/`, runs build, and composer i18n. Always run a full build and smoke-check after a version change so `build/<version>/` matches the new number.

## Build and dist

- **Development:** `npm run start` (hot reload).
- **Production build:** `npm run build` → outputs to `build/<version>/`.
- **Simulate CI build:** `npm run simulate-runner-build` or `npm run srb` – clean, install deps, PHP deps, build, create dist, create zip. Use this to verify the same steps CI uses.
- **Dist zip:** `npm run create:dev` (or similar) builds the distributable tree and zip (e.g. `bluehost-wordpress-plugin.zip`) using `.distinclude` / `.distignore`.

## Day-to-day checklist

- Run `npm run lint:js` and `composer run lint` (and fix) before committing.
- After changing version, run `npm run set-version-bump` (or minor) and confirm `build/<version>/` and all three version locations are updated.
- For release steps, see [release.md](release.md).
