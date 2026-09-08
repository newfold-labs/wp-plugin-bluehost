# Testing

This document describes the testing setup for the Bluehost WordPress Plugin: **Playwright** E2E tests and **WPUnit** (PHPUnit + Codeception wp-browser) tests, plus how they are run in CI.

## Playwright E2E testing

### Overview

The project uses **Playwright** for end-to-end tests in the browser. Tests run against a WordPress instance started with **wp-env**; the plugin is loaded from a built distribution copy.

### Configuration

- **Config file:** **`playwright.config.mjs`** (repository root).
- **Port:** Taken from **`.wp-env.json`** (default dev port, e.g. 8882). In CI, **`.wp-env.override.json`** may be created by the workflow with a different core/phpVersion.
- **Projects:** Playwright “projects” (plugin + modules) are defined in **`tests/playwright/playwright-projects.json`**, which can be generated/updated by **`.github/scripts/generate-playwright-projects.mjs`** (run via `npm run test:playwright:update-projects`). The config merges in optional **`project-overrides.json`** per project.
- **Global setup:** **`tests/playwright/global-setup.js`** runs before tests in the default (wp-env) mode only. Skipped when **`BASE_URL`** is set. See [Global setup (WP-CLI)](#global-setup-wp-cli) and [Test tagging](#test-tagging-env--prefix) below.

### Test tagging (`env-*` prefix)

Playwright tests can carry **`@env-*`** tags to control which specs run in each mode. Tags are applied on `test` or `test.describe` via Playwright's `{ tag: '…' }` option.

The `env-*` prefix means **how the runner selects tests** based on environment (`BASE_URL`, wp-env, deploy target). It is separate from future tags such as `@requires-woocommerce` (site prerequisites) or runtime `test.skip()` helpers.

#### Tag reference

| Tag | Meaning | Default (local / wp-env) | Remote (`BASE_URL` set) |
|-----|---------|--------------------------|-------------------------|
| **`@env-any`** | Generic smoke: works on any WordPress install pointed to by `baseURL`. No CLI setup, non-destructive, human-verified on a real target. | Runs (with full suite) | **Runs** |
| **`@env-remote`** | Hosted / production-only behaviour (SSO login button, live portal URLs, real hosting capabilities). | **Skipped** (`grepInvert`) | **Runs** |
| **`@env-local`** | Needs wp-env + **WP-CLI** (or equivalent shell) to establish or reset **specific initial state** before assertions. | Runs | **Skipped** (not in remote `grep`) |
| *(untagged)* | Same runtime as `@env-local` until tagged; prefer explicit `@env-local` on CLI-dependent blocks. | Runs | Skipped |

**Config behavior** (`playwright.config.mjs`):

- **`BASE_URL` unset:** full local suite, excluding `@env-remote`.
- **`BASE_URL` set:** only `@env-any` and `@env-remote`; no `globalSetup`, no `webServer`.

#### What is a poor fit for live / `@env-any`?

Remote runs have **no WP-CLI**, no disposable fixture, and often a **persistent** site. Avoid tagging (or split out of) tests that depend on:

| Pattern | Why it fails on live | Prefer |
|---------|----------------------|--------|
| **`global-setup.js` / `wordpress.wpCli()`** | Shell access does not exist against a deployed URL | `@env-local` only |
| **`beforeEach` / `beforeAll` that call CLI helpers** — e.g. `newfold.clearCapabilities()`, `newfold.setComingSoon()`, `setCapability()`, `installWooCommerce()` | State cannot be seeded remotely | `@env-local` block, or split file |
| **Hardcoded `localhost` / wp-env URLs** | Wrong host on other bases | Relative paths + dynamic assertions, or `@env-local` |
| **`process.env.WP_VERSION` / `PHP_VERSION` assertions** | Values come from `.wp-env.json`, not the remote site | `@env-local` |
| **`toHaveScreenshot` / visual baselines** | Pixels differ per environment | `@env-local` or separate baseline per env |
| **UI mutations** — toggles, settings changes, coming-soon enable/disable | Alters a shared or production site | `@env-local` |
| **Assuming a blank or known-capability state** | Live site has real customer data and capabilities | `@env-local`, or read-only checks only |

If a file mixes portable and CLI-dependent tests, **split into separate `test.describe` blocks** (see `dashboard-widgets.spec.js`: `@env-any` a11y block, `@env-remote` account links, untagged/`@env-local` block with `clearCapabilities()` in `beforeEach`).

#### Designing good `@env-any` tests

Favour tests that check things **likely to exist on any healthy install** with the plugin active, without preparing state:

- **Navigation and routing** — admin menu, hash routes, page loads (`navigation.spec.js`).
- **Read-only visibility** — sections render, headings present, a11y on a stable container (`home` a11y, `settings` coming-soon section).
- **Mocked network** — `page.route()` intercepts at the browser; safe on any origin (`help.spec.js`, TenWeb failure path in `admin-feature-toggles.spec.js`).
- **Relative URLs** — `wp-login.php`, `wp-admin/...` via Playwright `baseURL`, not hardcoded hosts.

Tag **`@env-any` only after** the test passes against a non-wp-env `BASE_URL` (deploy staging, shared host, or local URL with `BASE_URL=http://localhost:<port>`).

Use **`@env-remote`** when the assertion depends on **real hosting branding or live portal integration** that wp-env does not model (SSO button on `wp-login.php`, Bluehost account widget portal links, marketplace affiliate URLs).

#### `@env-local` — state-dependent functionality tests

Reserve **`@env-local`** (or leave untagged) for tests whose **purpose is to verify behaviour given a controlled starting state**, for example:

- Toggle a feature on, assert UI, toggle off (`admin-feature-toggles` success paths).
- Change autoupdate or comment settings and assert notifications (`settings.spec.js` mutation tests).
- Set coming soon via CLI, assert admin notice, reset (`coming-soon-notice.spec.js`).
- Clear capabilities, mutate widgets, exercise help center with injected caps (`dashboard-widgets` wp-env block).

These need **repeatable setup** that today is done through **`wordpress.wpCli()`** and helpers in **`newfold.mjs`**. That is only available when wp-env (or similar) is running — not when `BASE_URL` points at a live site.

Until we have safe, supported ways to set equivalent state on a persistent remote site (admin UI-only setup with guaranteed cleanup, dedicated smoke-test accounts, feature flags, etc.), **do not tag these `@env-any`**.

Example layout:

```js
test.describe('Dashboard Widgets (env-any)', { tag: '@env-any' }, () => {
  test.beforeEach(async ({ page }) => {
    await auth.navigateToAdminPage(page, 'index.php');
    // No clearCapabilities() — read-only a11y only
  });
  test('Bluehost Widgets are all Accessible', async ({ page }) => { ... });
});

test.describe('Dashboard Widgets (wp-env)', { tag: '@env-local' }, () => {
  test.beforeEach(async ({ page }) => {
    await auth.navigateToAdminPage(page, 'index.php');
    await newfold.clearCapabilities();
  });
  test('Site Preview Widget', async ({ page }) => { ... });
});
```

#### Examples and commands

```js
test.describe('Navigation', { tag: '@env-any' }, () => { ... });
test('Home Page Quick Links exist', { tag: '@env-remote' }, async ({ page }) => { ... });
test.describe('Settings mutations', { tag: '@env-local' }, () => { ... });
```

**Running against a custom `BASE_URL` locally:**

```bash
BASE_URL=https://your-site.example npx playwright test --reporter=line
```

Set **`WP_ADMIN_USERNAME`** and **`WP_ADMIN_PASSWORD`** to valid admin credentials for that site.

#### Tags vs helpers

| Mechanism | Use for |
|-----------|---------|
| **`@env-*` tags** | Static runner selection (`grep` in config) |
| **`newfold.supportsWoo()` / `getSkipMessage()`** | Runtime: WP/PHP version or plugin requirements in **wp-env** matrix (uses WP-CLI today) |
| **`test.skip()`** | Runtime: feature not registered, plugin missing on this site |

**Module repos:** use the same `@env-any` / `@env-remote` / `@env-local` convention. Tag only after verifying behaviour in the appropriate mode.

### Global setup (WP-CLI)

**`tests/playwright/global-setup.js`** runs WP-CLI commands through **`wordpress.wpCli()`** in **`tests/playwright/helpers/wordpress.mjs`** before any browser tests start.

| Step | Command | Notes |
|------|---------|--------|
| Permalinks | `rewrite structure '/%postname%/' --hard` | Via **`wordpress.wpCliWithRetry()`** (2 attempts, 2s backoff). [`wp rewrite structure`](https://developer.wordpress.org/cli/commands/rewrite/structure/). `failOnNonZeroExit: false` |
| Deactivate extra plugins | `plugin deactivate <plugin>` | `failOnNonZeroExit: false` per plugin |

**Why one command for permalinks?**  
`wp rewrite structure <pattern> --hard` replaces the older two-step `option update permalink_structure` + `rewrite flush --hard`. It updates the permalink option and regenerates rewrite rules; `--hard` also updates `.htaccess`.

**`failOnNonZeroExit` in global setup:**  
Only throws when explicitly `true`. Global setup passes `false` so a transient CLI failure does not abort the run. **`wordpress.isWpCliFailure()`** checks the return value and logs success or failure (permalink always; plugin deactivation only on failure) so later test failures are easier to diagnose.

**Extra plugins in global setup:**  
wp-env may bundle third-party plugins (Jetpack, Yoast, etc.) that are active by default. Global setup deactivates them so they do not load during tests; files remain installed. Use [`wp plugin deactivate`](https://developer.wordpress.org/cli/commands/plugin/deactivate/) only — not uninstall/delete — to avoid uninstall hooks and keep setup tolerant of missing plugins.

**`wordpress.wpCli()` helpers** (see helper JSDoc for full detail):

- **`wpCli(command, options?)`** — run a single WP-CLI command via wp-env.
- **`wpCliWithRetry(command, options?, { maxAttempts?, delayMs? })`** — retry on failure (default 2 attempts, 2s delay). Returns `{ result, attempt }`. Used in global setup for permalink setup; available to module tests for flaky CLI steps.
- **`isWpCliFailure(result)`** / **`formatWpCliResult(result)`** — interpret return values for logging or assertions.
- **Return value** — stdout string, `0` for empty success, or `Error: …` / exit code on failure.
- **`failOnNonZeroExit`** — only throws when explicitly set to `true`. Omitted or `false` preserves legacy return behavior.
- **`timeout`** — defaults to **120000 ms** (2 minutes) so CI runs do not hang indefinitely; pass `0` to disable.
- **`cwd`** — override plugin root; otherwise uses `PLUGIN_DIR` (set in `playwright.config.mjs` and global setup) or `process.cwd()`.

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

The config uses **Chrome** (Chromium), **headless: true**, and in non-CI / non-remote mode can start **webServer** with `wp-env start`. In CI the workflow starts wp-env separately and runs `npx playwright test --reporter=line`. When **`BASE_URL`** is set, `webServer` and `globalSetup` are skipped and only `@env-any` / `@env-remote` tests run.

### Playwright CI workflows

| Workflow file | When it runs | What it does |
|---------------|--------------|--------------|
| **`.github/workflows/playwright-tests.yml`** | Push to `main`/`develop`, PR (opened/sync/reopened/ready), or manual | **Build** job: composer, npm, build, rsync dist, upload artifact. **Test** job: download artifact, create `.wp-env.override.json` pointing plugin to dist, `npx wp-env start`, `npx playwright install --with-deps chromium`, `npx playwright test --reporter=line`. Uploads **playwright-report** and debug.log on failure. |
| **`.github/workflows/playwright-matrix.yml`** | PR or manual (skips for most Dependabot PRs) | Matrix over PHP 7.4–8.4 and WordPress 6.9/7.0/7.1. For each cell: build dist, create override with that core/phpVersion, wp-env start, run Playwright. Artifacts named e.g. `playwright-report-wp6.9-php8.3`. |
| **`.github/workflows/playground-preview.yml`** | PR (non-fork) | Builds plugin, publishes preview ZIP to GitHub Pages, comments a Playground link. **`playwright-env-any`** job (same workflow) starts a local Playground server from that ZIP and runs **`@env-any`** tests against it. |
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

## Deploy smoke tests (Playwright)

**`.github/workflows/deploy-and-test.yml`** deploys the plugin to **bluehost-shared**, then runs Playwright against the live site:

- **Triggers:** push to **`main`** or **workflow_dispatch** only — not pull requests (SSH deploy + production secrets).
- Sets **`BASE_URL`** from `vars.SITE_URL` (normalized in the workflow).
- Runs `npx playwright test` — config filters to **`@env-any`** and **`@env-remote`** only.
- Credentials: **`WP_ADMIN_USERNAME`** / **`WP_ADMIN_PASSWORD`** from GitHub secrets.

This replaces the legacy Cypress help spec for post-deploy smoke testing.

### PR remote smoke (Playground `@env-any`)

On pull requests, **`.github/workflows/playground-preview.yml`** includes a **`playwright-env-any`** job that runs after the preview ZIP is published:

1. **`playground-preview`** builds the plugin and uploads `bluehost-pr-<PR#>.zip` to GitHub Pages.
2. **`playwright-env-any`** downloads that ZIP, starts **`@wp-playground/cli`** in a **child process** (Playwright `webServer`), mounts the unzipped files, sets **`BASE_URL`** to the CLI `serverUrl`, and runs `npx playwright test --grep @env-any --project newfold-labs/wp-plugin-bluehost`.

The browser Playground URL (`playground.wordpress.net/#…`) is for manual QA; CI uses the CLI server in a separate process because Playwright needs a normal HTTP origin and the server must keep its own event loop. Playground's `login: true` blueprint flag auto-authenticates admin requests, so tests skip the `wp-login.php` credential flow (`PLAYGROUND_AUTO_LOGIN` / `PLAYGROUND_PLUGIN_DIR`).

---

## Quick reference

| Test type | Config / entry | Run locally | CI workflow(s) |
|-----------|----------------|-------------|----------------|
| **Playwright E2E** | `playwright.config.mjs`, `tests/playwright/specs/` | `npm run test:e2e` or `npx playwright test` | `playwright-tests.yml`, `playwright-matrix.yml`, `playwright-tests-beta.yml` |
| **Playwright (deploy smoke)** | `@env-any` / `@env-remote` tagged specs | `BASE_URL=https://… npx playwright test` | `deploy-and-test.yml` (main only) |
| **Playwright (PR Playground smoke)** | `@env-any` tagged specs | `PLAYGROUND_PLUGIN_DIR=/path/to/unzipped/plugin npx playwright test --grep @env-any` | `playground-preview.yml` (`playwright-env-any` job) |
| **PHPUnit (unit)** | `phpunit.xml`, `tests/phpunit/` | `vendor/bin/phpunit` (with or without `BLUEHOST_PHPUNIT_MINIMAL=1`) | `codecoverage-main.yml` (reusable) |
| **WPUnit (Codeception)** | `tests/wpunit.suite.yml`, `tests/wpunit/` | Codeception/WP test env (as in reusable workflow) | `codecoverage-main.yml` (reusable) |
