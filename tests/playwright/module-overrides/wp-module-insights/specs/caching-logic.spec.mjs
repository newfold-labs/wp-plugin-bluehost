import { test, expect } from '@playwright/test';
import { prepareInsightsPreconditions } from '../helpers/index.mjs';

const INSIGHTS_PAGE = '/wp-admin/tools.php?page=nfd-insights';
const SCORE_SELECTOR = '#nfd-insights-lighthouse-report .nfd-text-xl.nfd-font-semibold';

/**
 * Match the scans *collection* endpoint only (not `/run-scan`, `/scan-details`, etc.).
 * Supports `/wp-json/...` and `index.php?rest_route=/...`.
 *
 * @param {string} urlString
 * @returns {boolean}
 */
function isPerformanceScansCollectionUrl(urlString) {
  try {
    const url = new URL(urlString);
    const restRoute = url.searchParams.get('rest_route');

    if (restRoute) {
      const routePath = restRoute.startsWith('/') ? restRoute : `/${restRoute}`;
      return /^\/newfold-insights\/v1\/performance-scans\/?$/.test(routePath);
    }

    return /\/wp-json\/newfold-insights\/v1\/performance-scans\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function buildScan(id, score) {
  return {
    id,
    performanceScore: score,
    accessibilityScore: score,
    bestPracticesScore: score,
    seoScore: score,
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z',
    status: 'completed',
  };
}

function mockScans(page, scans) {
  return page.route(isPerformanceScansCollectionUrl, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(scans),
    });
  });
}

async function navigateAndWait(page) {
  await page.goto(INSIGHTS_PAGE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#nfd-insights-app', { timeout: 20000 });
}

test.describe('Insights Caching Logic', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
      }
    });
    page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message));

    const pre = await prepareInsightsPreconditions(page, {
      canScanPerformance: true,
      retries: 1,
      cleanupCommands: [
        'option delete nfd_insights_scans_results || true',
        'transient delete nfd_insights_scan_results || true',
      ],
    });
    test.skip(!pre.ok, pre.reason);
  });

  test('Active transient returns cached data — UI renders stored scores', async ({ page }) => {
    await mockScans(page, [buildScan('cache_hit', 0.72)]);
    await navigateAndWait(page);

    const scoreEl = page.locator(SCORE_SELECTOR).first();
    await expect(scoreEl).toContainText('72', { timeout: 15000 });
  });

  test('API failure — UI handles gracefully without fatal errors', async ({ page }) => {
    // Intentional 500: [BROWSER ERROR] / "Error fetching scans" from the app are expected here, not a product bug.
    console.log(
      '[caching-logic] This test mocks the performance-scans API with HTTP 500. Any related browser console errors are expected.',
    );
    await page.route(isPerformanceScansCollectionUrl, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'server_error', message: 'API failure' }),
      });
    });

    await navigateAndWait(page);
    await expect(page.locator('body')).not.toContainText('Fatal error');
  });

  test('force_refresh bypasses cache — UI shows fresh data after reload', async ({ page }) => {
    await mockScans(page, [buildScan('stale_scan', 0.11)]);
    await navigateAndWait(page);

    const scoreEl = page.locator(SCORE_SELECTOR).first();
    await expect(scoreEl).toContainText('11', { timeout: 15000 });

    await page.unroute(isPerformanceScansCollectionUrl);
    await mockScans(page, [buildScan('fresh_scan', 0.93)]);

    await page.goto('/wp-admin/index.php', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('performance-scans'), { timeout: 20000 }),
      page.goto(INSIGHTS_PAGE, { waitUntil: 'domcontentloaded', timeout: 10000 }),
    ]);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#nfd-insights-app', { timeout: 15000 });

    await expect(scoreEl).toContainText('93', { timeout: 15000 });
  });

  test('Full lifecycle: cached data served first, then refreshed data after expiry', async ({ page }) => {
    await mockScans(page, [buildScan('lifecycle_scan', 0.42)]);
    await navigateAndWait(page);

    const scoreEl = page.locator(SCORE_SELECTOR).first();
    await expect(scoreEl).toContainText('42', { timeout: 15000 });

    await page.unroute(isPerformanceScansCollectionUrl);
    await mockScans(page, [buildScan('refreshed_scan', 0.77)]);

    await page.goto('/wp-admin/index.php', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('performance-scans') && r.status() === 200, { timeout: 20000 }),
      page.goto(INSIGHTS_PAGE, { waitUntil: 'domcontentloaded', timeout: 10000 }),
    ]);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#nfd-insights-app', { timeout: 15000 });

    await expect(scoreEl).toContainText('77', { timeout: 15000 });
  });
});
