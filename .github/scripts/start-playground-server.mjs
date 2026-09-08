/**
 * Long-running WordPress Playground server for Playwright webServer.
 * Run as a child process — do not call runCLI in the same process as Playwright tests.
 *
 * Env:
 *   PLAYGROUND_PLUGIN_DIR — absolute path to unzipped plugin files
 *   PLAYGROUND_PORT — optional (default 9400)
 *   PLAYGROUND_READY_FILE — path to write when HTTP boot completes (parent polls this)
 */
import { runCLI } from '@wp-playground/cli';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const pluginDir = process.env.PLAYGROUND_PLUGIN_DIR?.trim();
const port = Number(process.env.PLAYGROUND_PORT || 9400);
const readyFile = process.env.PLAYGROUND_READY_FILE?.trim();

if (!pluginDir) {
  console.error('PLAYGROUND_PLUGIN_DIR is required');
  process.exit(1);
}

if (!readyFile) {
  console.error('PLAYGROUND_READY_FILE is required');
  process.exit(1);
}

if (existsSync(readyFile)) {
  unlinkSync(readyFile);
}

const resolvedPluginDir = path.resolve(pluginDir);
if (!existsSync(path.join(resolvedPluginDir, 'bluehost-wordpress-plugin.php'))) {
  console.error(
    `Expected bluehost-wordpress-plugin.php in ${resolvedPluginDir}`
  );
  process.exit(1);
}

const pluginFolderName = path.basename(resolvedPluginDir);
const pluginPath = `${pluginFolderName}/bluehost-wordpress-plugin.php`;

console.log(`Starting Playground on port ${port}`);
console.log(`Mounting ${resolvedPluginDir} as wp-content/plugins/${pluginFolderName}`);

const cli = await runCLI({
  command: 'server',
  port,
  workers: 1,
  php: '8.1',
  wp: 'latest',
  login: true,
  mount: [
    {
      hostPath: resolvedPluginDir,
      vfsPath: `/wordpress/wp-content/plugins/${pluginFolderName}`,
    },
  ],
  blueprint: {
    landingPage: '/wp-admin/admin.php?page=bluehost#/home',
    preferredVersions: { php: '8.1', wp: 'latest' },
    login: true,
    steps: [
      {
        step: 'activatePlugin',
        pluginPath,
      },
    ],
  },
});

const baseURL = cli.serverUrl.endsWith('/') ? cli.serverUrl : `${cli.serverUrl}/`;
const adminUrl = `${baseURL}wp-admin/`;
const bootDeadline = Date.now() + 180_000;
let httpReady = false;

while (Date.now() < bootDeadline) {
  try {
    const response = await fetch(adminUrl, { redirect: 'follow' });
    if (response.status !== 502) {
      httpReady = true;
      break;
    }
  } catch {
    // Playground still booting in this process
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

if (!httpReady) {
  console.error(`Playground HTTP not ready at ${adminUrl} within 180s`);
  process.exit(1);
}

writeFileSync(readyFile, baseURL, 'utf8');
console.log(`Playground ready at ${baseURL}`);
console.log(`Playground ready file: ${readyFile}`);

async function shutdown() {
  try {
    if (existsSync(readyFile)) {
      unlinkSync(readyFile);
    }
    if (cli?.server) {
      await new Promise((resolve) => {
        cli.server.close(() => resolve());
      });
    }
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
