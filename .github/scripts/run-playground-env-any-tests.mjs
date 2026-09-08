/**
 * Start WordPress Playground with the PR preview plugin ZIP, then run @env-any Playwright tests.
 *
 * Env:
 *   PLAYGROUND_PLUGIN_ZIP_URL — HTTPS URL to the plugin zip (GitHub Pages preview)
 *   PLAYWRIGHT_PROJECT — optional project name (default: newfold-labs/wp-plugin-bluehost)
 */
import { spawn } from 'node:child_process';
import { runCLI } from '@wp-playground/cli';

const zipUrl = process.env.PLAYGROUND_PLUGIN_ZIP_URL?.trim();
const project = process.env.PLAYWRIGHT_PROJECT || 'newfold-labs/wp-plugin-bluehost';

if (!zipUrl) {
  console.error('PLAYGROUND_PLUGIN_ZIP_URL is required');
  process.exit(1);
}

const blueprint = {
  landingPage: '/wp-admin/admin.php?page=bluehost#/home',
  preferredVersions: { php: '8.1', wp: 'latest' },
  login: true,
  steps: [
    {
      step: 'installPlugin',
      pluginData: { resource: 'url', url: zipUrl },
      options: { activate: true },
    },
  ],
};

/**
 * @param {string} url
 * @param {number} attempts
 * @param {number} delayMs
 */
async function waitForHttpOk(url, attempts = 60, delayMs = 5000) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) {
        console.log(`Ready: ${url} (${response.status})`);
        return;
      }
      console.log(`Waiting for ${url} (attempt ${i}/${attempts}, HTTP ${response.status})`);
    } catch (error) {
      console.log(`Waiting for ${url} (attempt ${i}/${attempts}): ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

/**
 * @param {string} baseURL
 * @param {Record<string, string>} env
 */
function runPlaywright(baseURL, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'playwright',
        'test',
        '--grep',
        '@env-any',
        '--project',
        project,
        '--reporter',
        'line',
      ],
      {
        env: {
          ...process.env,
          ...env,
          CI: 'true',
          BASE_URL: baseURL,
          WP_ADMIN_USERNAME: 'admin',
          WP_ADMIN_PASSWORD: 'password',
        },
        stdio: 'inherit',
      }
    );

    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

/** @type {import('@wp-playground/cli').RunCLIServer | undefined} */
let cliServer;

try {
  console.log(`Installing plugin from ${zipUrl}`);
  cliServer = await runCLI({
    command: 'server',
    blueprint,
    login: true,
    quiet: true,
  });

  const baseURL = cliServer.serverUrl.endsWith('/')
    ? cliServer.serverUrl
    : `${cliServer.serverUrl}/`;

  console.log(`Playground server: ${baseURL}`);
  await waitForHttpOk(`${baseURL}wp-login.php`);

  const exitCode = await runPlaywright(baseURL, {});
  process.exitCode = exitCode;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (cliServer?.server) {
    await new Promise((resolve) => {
      cliServer.server.close(() => resolve());
    });
  }
}
