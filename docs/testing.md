# Testing

This document describes the testing setup for the Bluehost WordPress Plugin: **Playwright** E2E tests and **WPUnit** (PHPUnit + Codeception wp-browser) tests, plus how they are run in CI.

## Playwright E2E testing

### Overview

The project uses **Playwright** for end-to-end tests in the browser. Tests run against a WordPress instance started with **wp-env**; the plugin is loaded from a built distribution copy.

### Configuration

- **Config file:** **`playwright.config.mjs`** (repository root).
- **Port:** Taken from **`.wp-env.json`** (default dev port, e.g. 8882). In CI, **`.wp-env.override.json`** may be created by the workflow with a different core/phpVersion.
- **Projects:** Playwright “projects” (plugin + modules) are defined in **`tests/playwright/playwright-projects.json`**, which can be generated/updated by **`.github/scripts/generate-playwright-projects.mjs`** (run via `npm run test:playwright:update-projects`). The config merges in optional **`project-overrides.json`** per project.
- **Global setup:** **`tests/playwright/global-setup.js`** runs before tests (e.g. sets permalink structure and flushes rewrite rules via WP-CLI in wp-env).

### Test layout

- **Specs:** **`tests/playwright/specs/`** – e.g. `home.spec.js`, `help.spec.js`, `navigation.spec.js`, `settings.spec.js`, `dashboard-widgets.spec.js`, `version-check.spec.js`, `vrt.spec.js`.
- **Helpers:** **`tests/playwright/helpers/`** – shared utilities (e.g. `utils.mjs`).
- **Fixtures:** **`tests/playwright/fixtures/`** – test data if needed.
- **Output:** **`tests/playwright/test-results/`** – test results, screenshots, traces (retain-on-failure). Reports can be generated under **`tests/playwright/reports/`** if enabled in config.

### Running Playwright locally

1. **Start WordPress (wp-env):**

   ```bash
   npx wp-env start
   ```

2. **Run all Playwright tests:**

   ```bash
   npm run test:e2e
   # or
   npx playwright test
   ```

3. **Optional:** Regenerate projects (e.g. after adding a module with Playwright tests):

   ```bash
   npm run test:playwright:update-projects
   ```

4. **Optional:** Run with UI or a specific spec:

   ```bash
   npx playwright test tests/playwright/specs/home.spec.js
   npx playwright test --ui
   ```

The config uses **Chrome** (Chromium), **headless: true**, and in non-CI can start **webServer** with `wp-env start`. In CI the workflow starts wp-env separately and runs `npx playwright test --reporter=line`.

### Playwright CI workflows

| Workflow file | When it runs | What it does |
|---------------|--------------|--------------|
| **`.github/workflows/playwright-tests.yml`** | Push to `main`/`develop`, PR (opened/sync/reopened/ready), or manual | **Build** job: composer, npm, build, rsync dist, upload artifact. **Test** job: download artifact, create `.wp-env.override.json` pointing plugin to dist, `npx wp-env start`, `npx playwright install --with-deps chromium`, `npx playwright test --reporter=line`. Uploads **playwright-report** and debug.log on failure. |
| **`.github/workflows/playwright-matrix.yml`** | PR or manual (skips for most Dependabot PRs) | Matrix over PHP 7.4–8.4 and WordPress 6.7/6.8/6.9. For each cell: build dist, create override with that core/phpVersion, wp-env start, run Playwright. Artifacts named e.g. `playwright-report-wp6.9-php8.3`. |
| **`.github/workflows/playwright-tests-beta.yml`** | Weekly (Mondays 6:00 UTC) or manual | Fetches WordPress **beta** from api.wordpress.org, configures wp-env with beta core, builds plugin, runs Playwright. |

See [workflows.md](workflows.md) for full workflow descriptions.

---

## WPUnit and PHPUnit tests

### Overview

- **PHPUnit** is used for **unit tests** that may or may not load WordPress (e.g. minimal sanity tests in `tests/phpunit/`).
- **Codeception** with **wp-browser** and the **Wpunit** suite is used for **WPUnit** tests that run inside a WordPress test environment (integration-style tests in `tests/wpunit/`).

The **codecoverage-main** workflow runs both and merges coverage.

### PHPUnit (unit tests)

- **Config:** **`phpunit.xml`** (root). Bootstrap: **`tests/phpunit/bootstrap.php`**.
- **Tests directory:** **`tests/phpunit/`** – e.g. `PluginTest.php`, `DataTest.php`, `JetpackTest.php`, `PartnersTest.php`, `UpdatesTest.php`, `BaseTest.php`.
- **Bootstrap behavior:** If `WP_PHPUNIT__DIR` is set (e.g. in CI), the bootstrap loads the WordPress test suite. If **`BLUEHOST_PHPUNIT_MINIMAL=1`** is set, it skips WordPress and only runs tests that don’t require it (e.g. `PluginTest`).
- **Running locally (minimal, no WordPress):**

  ```bash
  BLUEHOST_PHPUNIT_MINIMAL=1 vendor/bin/phpunit tests/phpunit/PluginTest.php
  ```

- **Running with WordPress:** Requires the WordPress test suite (e.g. `WP_PHPUNIT__DIR` set to the WP test install). CI provides this via the reusable codecoverage workflow.

### WPUnit (Codeception wp-browser)

- **Suite config:** **`tests/wpunit.suite.yml`** – defines the **WpunitTester** actor, **WPLoader** and **Helper\Wpunit** modules, and DB/site settings (via placeholders like `%WP_ROOT_FOLDER%`, `%TEST_DB_HOST%`, etc.).
- **Tests directory:** **`tests/wpunit/`** – Codeception/ wp-browser tests that run against a loaded WordPress instance.
- **Bootstrap:** Referenced in the suite as **`_bootstrap.php`** (under `tests/`).

These tests are executed by the **newfold-labs/workflows** reusable codecoverage workflow, which sets up the WordPress test environment and runs both PHPUnit and the wpunit suite across multiple PHP versions.

### Code coverage and CI workflow

| Workflow file | When it runs | What it does |
|---------------|--------------|--------------|
| **`.github/workflows/codecoverage-main.yml`** | Push to `main`, PR to `main`/`develop`/`release/*`, or manual | Calls **`newfold-labs/workflows/.github/workflows/reusable-codecoverage.yml`**. Runs **PHPUnit** and **Codeception wp-browser wpunit** tests, generates and merges code coverage (PHP 7.4–8.4), pushes HTML report to GitHub Pages and comments coverage on PRs. Minimum coverage: 25%. |

Inputs passed to the reusable workflow include `php-versions`, `coverage-php-version` (7.4), `repository-name`, and `minimum-coverage`.

See [workflows.md](workflows.md) for the full list of workflows.

---

## Cypress (legacy / deploy-and-test)

A **Cypress** spec is still used in **`.github/workflows/deploy-and-test.yml`** after deploying the plugin to the **bluehost-shared** server:

- **Env:** `CYPRESS_TEST_PATH: tests/cypress/integration/help.cy.js`
- The workflow runs **Cypress** against the live deployed site (`vars.SITE_URL`) to smoke-test after deploy.

Cypress is **not** the primary E2E runner for PRs; Playwright is. For Playwright vs Cypress and paths, see [reference.md](reference.md).

---

## Quick reference

| Test type | Config / entry | Run locally | CI workflow(s) |
|-----------|----------------|-------------|----------------|
| **Playwright E2E** | `playwright.config.mjs`, `tests/playwright/specs/` | `npm run test:e2e` or `npx playwright test` | `playwright-tests.yml`, `playwright-matrix.yml`, `playwright-tests-beta.yml` |
| **PHPUnit (unit)** | `phpunit.xml`, `tests/phpunit/` | `vendor/bin/phpunit` (with or without `BLUEHOST_PHPUNIT_MINIMAL=1`) | `codecoverage-main.yml` (reusable) |
| **WPUnit (Codeception)** | `tests/wpunit.suite.yml`, `tests/wpunit/` | Codeception/WP test env (as in reusable workflow) | `codecoverage-main.yml` (reusable) |
| **Cypress (deploy)** | `tests/cypress/integration/help.cy.js` | N/A (runs in CI against deployed site) | `deploy-and-test.yml` |
