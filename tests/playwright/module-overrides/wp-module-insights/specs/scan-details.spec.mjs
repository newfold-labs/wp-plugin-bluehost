import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
  waitForInsightsPage,
  prepareInsightsPreconditions,
} from '../helpers/index.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Match the scans *collection* endpoint only (not `/run-scan`, `/scan-details`, etc.).
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

/**
 * @param {string} urlString
 * @returns {boolean}
 */
function isPerformanceScansScanDetailsUrl(urlString) {
  try {
    const url = new URL(urlString);
    const restRoute = url.searchParams.get('rest_route');

    if (restRoute) {
      const routePath = restRoute.startsWith('/') ? restRoute : `/${restRoute}`;
      return /^\/newfold-insights\/v1\/performance-scans\/scan-details\b/.test(routePath);
    }

    return /\/wp-json\/newfold-insights\/v1\/performance-scans\/scan-details\b/.test(url.pathname);
  } catch {
    return false;
  }
}

const mockAuditDetails = {
  audits: {
    'color-contrast': {
      id: 'color-contrast',
      title: 'Mocked Background and foreground colors',
      score: 0,
      details: {
        type: 'table',
        headings: [{ key: 'node', valueType: 'text', label: 'Failing Elements' }],
        items: [{ node: 'Mocked failing element' }],
      },
    },
  },
};

test.describe('Scan Details Page', () => {
  test.beforeEach(async ({ page }) => {
    const pre = await prepareInsightsPreconditions(page, {
      canScanPerformance: true,
      retries: 1,
      cleanupCommands: [
        'option delete nfd_insights_last_scan || true',
        'transient delete nfd_insights_last_scan_result || true',
      ],
    });
    test.skip(!pre.ok, pre.reason);
  });

  test('Scan Result Details page loads and displays correct information', async ({ page }) => {
    const fixturePath = join(
      __dirname,
      '../fixtures/scans.json',
    );
    const fixtureData = await readFile(fixturePath, 'utf8');

    await page.route(isPerformanceScansCollectionUrl, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: fixtureData,
      });
    });

    await page.route(isPerformanceScansScanDetailsUrl, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuditDetails),
      });
    });

    await page.goto('/wp-admin/tools.php?page=nfd-insights&scan-result=999', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    await waitForInsightsPage(page);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Performance report');
    await expect(page.getByText(/Lighthouse audit for this scan/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();

    const firstAccordion = page.getByRole('button', { name: /Mocked/ }).first();
    await expect(firstAccordion).toBeVisible({ timeout: 10000 });
    await firstAccordion.click();

    const contentTable = page.locator('.nfd-accordion-content table').first();
    await expect(contentTable).toBeVisible();

    const tableRows = contentTable.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });
});
