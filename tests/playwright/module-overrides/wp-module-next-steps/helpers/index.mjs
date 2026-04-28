/**
 * Next Steps Module Test Helpers for Playwright (override)
 *
 * Hardens fixture seeding and interactive endpoint behavior for CI reliability.
 */
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pluginDir = process.env.PLUGIN_DIR || process.cwd();
const finalHelpersPath = join(pluginDir, 'tests/playwright/helpers/index.mjs');
const helpersUrl = pathToFileURL(finalHelpersPath).href;
const pluginHelpers = await import(helpersUrl);

let { auth, wordpress, newfold, a11y, utils } = pluginHelpers;
const { wpCli } = wordpress;
const { fancyLog } = utils;

const testPlan = JSON.parse(readFileSync(join(__dirname, '../fixtures/test-plan.json'), 'utf8'));
const testCardsPlan = JSON.parse(readFileSync(join(__dirname, '../fixtures/test-cards-plan.json'), 'utf8'));

function isWpCliError(output) {
  if (typeof output !== 'string') return false;
  return output.startsWith('Error:') || output.includes('Fatal error') || output.includes('Parse error');
}

/**
 * @param {string} command
 * @returns {Promise<{ok: boolean, output: string}>}
 */
async function runWpCli(command) {
  const raw = await wpCli(command);
  const output = typeof raw === 'string' ? raw : String(raw ?? '');
  return { ok: !isWpCliError(output), output };
}

/**
 * Verify nfd_next_steps option roughly matches expected fixture identity.
 *
 * @param {{ id: string, tracks?: any[] }} expectedPlan
 * @returns {Promise<boolean>}
 */
async function verifyNextStepsPlan(expectedPlan) {
  const get = await runWpCli('option get nfd_next_steps --format=json');
  if (!get.ok) return false;
  try {
    const parsed = JSON.parse(get.output);
    if (!parsed || parsed.id !== expectedPlan.id) return false;
    const expectedTracks = Array.isArray(expectedPlan.tracks) ? expectedPlan.tracks.length : 0;
    const actualTracks = Array.isArray(parsed.tracks) ? parsed.tracks.length : 0;
    return expectedTracks === actualTracks;
  } catch {
    return false;
  }
}

/**
 * Set a test plan fixture and verify persisted option.
 *
 * @param {object} plan
 * @param {number} retries
 * @returns {Promise<boolean>}
 */
async function setAndVerifyNextStepsData(plan, retries = 2) {
  let lastError = '';
  const json = JSON.stringify(plan).replace(/'/g, "'\\''");

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const set = await runWpCli(`option update nfd_next_steps '${json}' --format=json`);
    if (!set.ok) {
      lastError = set.output;
    } else if (await verifyNextStepsPlan(plan)) {
      return true;
    } else {
      lastError = 'option verification mismatch after update';
    }

    fancyLog(`Next Steps fixture setup retry (${attempt}/${retries}): ${lastError}`, 'yellow');
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  fancyLog(`Next Steps fixture setup failed: ${lastError}`, 'yellow');
  return false;
}

/**
 * Set next steps test fixture to database option.
 *
 * @returns {Promise<boolean>}
 */
async function setTestNextStepsData() {
  return setAndVerifyNextStepsData(testPlan, 2);
}

/**
 * Set next steps test fixture to database option (cards version).
 *
 * @returns {Promise<boolean>}
 */
async function setTestCardsNextStepsData() {
  return setAndVerifyNextStepsData(testCardsPlan, 2);
}

/**
 * Reset test data for clean test state.
 */
async function resetNextStepsData() {
  await wpCli('option delete nfd_next_steps', { failOnNonZeroExit: false });
}

/**
 * Mock interactive Next Steps update endpoints (tasks/sections/tracks) to remove backend flakiness.
 *
 * @param {import('@playwright/test').Page} page
 */
async function setupNextStepsInteractionMocks(page) {
  await page.route('**/newfold-next-steps*/v2/plans/tasks/**', async (route) => {
    const url = route.request().url();
    const taskIdMatch = url.match(/\/tasks\/([^/?]+)/);
    const taskId = taskIdMatch ? taskIdMatch[1] : 'unknown-task';
    const body = route.request().postDataJSON() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: taskId,
        status: body.status || 'done',
      }),
    });
  });

  await page.route('**/newfold-next-steps*/v2/plans/sections/**', async (route) => {
    const url = route.request().url();
    const sectionIdMatch = url.match(/\/sections\/([^/?]+)/);
    const sectionId = sectionIdMatch ? sectionIdMatch[1] : 'unknown-section';
    const body = route.request().postDataJSON() || {};
    const response = { id: sectionId };
    if (body.type === 'status') {
      response.status = body.value || 'new';
      if (response.status !== 'new') {
        response.date_completed = '2026-01-01 00:00:00';
      }
    } else if (body.type === 'open') {
      response.open = typeof body.value === 'boolean' ? body.value : true;
      response.status = 'new';
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });

  await page.route('**/newfold-next-steps*/v2/plans/tracks/**', async (route) => {
    const url = route.request().url();
    const trackIdMatch = url.match(/\/tracks\/([^/?]+)/);
    const trackId = trackIdMatch ? trackIdMatch[1] : 'unknown-track';
    const body = route.request().postDataJSON() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: trackId,
        open: typeof body.open === 'boolean' ? body.open : true,
      }),
    });
  });
}

export {
  auth,
  wordpress,
  newfold,
  a11y,
  utils,
  setTestNextStepsData,
  setTestCardsNextStepsData,
  resetNextStepsData,
  setupNextStepsInteractionMocks,
};
