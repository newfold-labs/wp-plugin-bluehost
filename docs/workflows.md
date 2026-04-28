# GitHub Actions workflows

All workflow files live in **`.github/workflows/`**. This document summarizes each workflow, when it runs, and what it does.

## Testing workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **playwright-tests.yml** | E2E/Playwright Tests | Push to `main`/`develop`, PR (opened/sync/reopened/ready), `workflow_dispatch` | Builds the plugin, starts wp-env with the built dist, runs Playwright E2E tests. Two jobs: **build** (composer, npm, rsync dist, upload artifact), **test** (download artifact, wp-env start, `npx playwright test`). Uploads Playwright report and debug.log on failure. |
| **playwright-matrix.yml** | Playwright Test Matrix | PR (opened/sync/reopened/ready), `workflow_dispatch` | Runs Playwright across a matrix of **PHP** (7.4, 8.0–8.4) and **WordPress** (6.7, 6.8, 6.9). Skips matrix for Dependabot PRs unless the PR touches `newfold-labs`. Builds dist, creates `.wp-env.override.json` per matrix cell, runs Playwright, and uploads per-env artifacts named by wp/php version. After matrix completion, a dedicated summary job posts a consolidated table of pass/fail counts by env and an aggregated cross-env failure list sorted by failure frequency. |
| **playwright-tests-beta.yml** | Playwright Tests in WordPress Beta | Cron (Mondays 6:00 UTC), `workflow_dispatch` | Runs Playwright against **WordPress beta** (fetched from api.wordpress.org). Builds plugin, configures wp-env with beta core zip, runs Playwright. Uses `.nvmrc` for Node; requires `NEWFOLD_ACCESS_TOKEN` for npm. |
| **codecoverage-main.yml** | Codecoverage-Main | Push to `main`, PR to `main`/`develop`/`release/*`, `workflow_dispatch` | Calls reusable **newfold-labs/workflows** workflow `reusable-codecoverage.yml`. Runs **PHPUnit** unit tests and **Codeception wp-browser wpunit** tests across PHP 7.4–8.4, merges coverage, publishes to GitHub Pages and PR comment. Minimum coverage 25%. See [testing.md](testing.md). |

## Lint and quality workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **lint.yml** | Lint | Push/PR when `**.php` or `package*.json` or `composer.*` or `phpcs.xml` change (on `main`/`develop`) | Runs **PHP_CodeSniffer** (PHP 7.4). Caches PHPCS scan cache. Outputs checkstyle report; on failure runs `cs2pr` to show results in the PR. |
| **eslint.yml** | ESLint | Push/PR when `src/**/*.js` change (on `main`/`develop`) | Runs **ESLint** via `npm run lint:js`. Uses Node 20, composer install, `NEWFOLD_ACCESS_TOKEN` for npm. |
| **workflow-lint.yml** | Scan & Lint Workflow Files | Push/PR when `**.yml` change, `workflow_dispatch` | Calls reusable **newfold-labs/workflows** `reusable-workflow-lint.yml` to scan and lint workflow YAML files. |

## Build and artifact workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **upload-artifact-on-push.yml** | Build Plugin | Push to `main`/`develop`, PR (opened/sync/reopened/ready), `workflow_dispatch` | **Only when repo is `newfold-labs/wp-plugin-bluehost`.** Validates version consistency (header, constant, package.json), builds plugin (composer, npm, rsync from `.distinclude`/`.distignore`), uploads artifact. Comments on PR with download link and note about Playground preview. |
| **upload-asset-on-release.yml** | Package Plugin | Release **published** | On release publish: validates version (tag vs header/constant/package.json), validates vendor dirs and (for non-prerelease) WP “Tested up to” vs `.wp-env.json`. Builds dist, creates zip, **uploads zip as release asset** via `gh release upload`. Optionally purges Cloudflare cache for the release API URL. |

## Deploy and post-deploy test

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **deploy-and-test.yml** | Deploy Plugin to Server | Push to `main`, `workflow_dispatch` | Deploys plugin to **bluehost-shared** environment: build (composer, npm, `create:dev` zip), upload artifact, SCP zip to server, extract and activate via WP-CLI. Then waits for site to respond and runs **Cypress** against the deployed site (`CYPRESS_TEST_PATH`: `tests/cypress/integration/help.cy.js`). Uses `vars` (e.g. `SITE_URL`, `PLUGIN_NAME`) and secrets (SSH, WP admin). |

## Release and release-infrastructure workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **newfold-prepare-release.yml** | Newfold Prepare Release | `workflow_dispatch` only | Manual release prep. Inputs: **level** (patch/minor/major), **target-branch** (default `main`), **source-branch** (default `develop`). Calls **newfold-labs/workflows** `reusable-plugin-prep-release.yml` to prepare the release (version bump, etc.). |
| **satis-webhook.yml** | Trigger Satis Build | Release **created** | When a release is created, sends a **repository_dispatch** to `newfold-labs/satis` with vendor/package/version so Satis can rebuild the package list. |
| **delete-release.yml** | Delete Release | Release **deleted** | When a release is deleted (repo must be `newfold-labs/wp-plugin-bluehost`), purges Cloudflare cache for the release API. |
| **cloudflare-clear-cache.yml** | Cloudflare Clear Cache | `workflow_dispatch` only | Manually purges Cloudflare cache for the plugin’s release API URL. |

## i18n and translation workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **i18n-crowdin-upload.yml** | Crowdin Upload Action | `workflow_dispatch` | Calls **newfold-labs/workflows** `i18n-crowdin-upload.yml` to upload source strings to Crowdin. Uses `vars.CROWDIN_PROJECT_ID` and `secrets.CROWDIN_PERSONAL_TOKEN`. |
| **i18n-crowdin-download.yml** | Crowdin Download Action | `workflow_dispatch` | Calls **newfold-labs/workflows** `i18n-crowdin-download.yml` to download translations from Crowdin (optional input: `base_branch`, default `main`). |
| **auto-translate.yml** | Check for Updates to Translations | Push to `develop`, `workflow_dispatch` | Calls **newfold-labs/workflows** `reusable-translations.yml` for the `wp-plugin-bluehost` text domain; uses npm for i18n scripts. Uses `TRANSLATOR_API_KEY`. |

## Playground (preview) workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **playground-preview.yml** | WordPress Playground Preview | PR (opened/sync/reopened/ready) | For non-fork PRs: builds plugin, deploys a **WordPress Playground** preview to GitHub Pages and comments on the PR with the preview link. Uses `contents`, `pull-requests`, `pages`, `id-token`. |
| **playground-cleanup.yml** | Cleanup Playground Preview | PR **closed** | Removes the Playground preview deployment from GitHub Pages for the closed PR. |

## Other workflows

| Workflow file | Name | Trigger | Purpose |
|---------------|------|---------|---------|
| **performance-cron.yml** | Visit Performance Test Site Every Thirty Minutes | Cron every 30 minutes, `workflow_dispatch` | Uses **Performance Test Site** environment. Curl-login and visits the posts page 3 times (with sleep). Keeps a performance test site “warm” or monitored. |
| **create-milestones.yml** | Create Milestone | Cron (Wednesdays noon UTC), `workflow_dispatch` (optional due date) | Creates a GitHub milestone; default due date 2 weeks from run. |

## Summary: workflows by concern

- **E2E (Playwright):** `playwright-tests.yml`, `playwright-matrix.yml`, `playwright-tests-beta.yml`
- **PHP/JS unit & wpunit coverage:** `codecoverage-main.yml` → reusable codecoverage workflow
- **Lint:** `lint.yml` (PHPCS), `eslint.yml` (JS), `workflow-lint.yml` (YAML)
- **Build on push/PR:** `upload-artifact-on-push.yml`
- **Release package:** `upload-asset-on-release.yml`
- **Deploy + Cypress on server:** `deploy-and-test.yml`
- **Release prep & Satis:** `newfold-prepare-release.yml`, `satis-webhook.yml`, `delete-release.yml`, `cloudflare-clear-cache.yml`
- **i18n:** `i18n-crowdin-upload.yml`, `i18n-crowdin-download.yml`, `auto-translate.yml`
- **Playground:** `playground-preview.yml`, `playground-cleanup.yml`
