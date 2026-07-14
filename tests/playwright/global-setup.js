import { execFileSync, execSync } from 'child_process';
import { dirname, join } from 'path';
import utils from './helpers/utils.mjs';
import wordpress from './helpers/wordpress.mjs';

/** Plugin root must match wp-env's cwd: loadConfig uses path.resolve('.'). */
function getPluginRoot(config) {
  if (config.configFile && config.configFile.length > 0) {
    return dirname(config.configFile);
  }
  return config.rootDir || process.cwd();
}

function runApplyPlaywrightModuleOverrides(config) {
  const pluginRoot = getPluginRoot(config);
  const script = join(pluginRoot, '.github/scripts/apply-playwright-module-overrides.mjs');
  // No shell: argv only, so path characters are not interpreted by a shell
  execFileSync(process.execPath, [script], { cwd: pluginRoot, stdio: 'inherit' });
}

async function globalSetup(config) {
  const pluginRoot = getPluginRoot(config);

  // Apply module spec overrides (separate process; see runApplyPlaywrightModuleOverrides)
  runApplyPlaywrightModuleOverrides(config);

  utils.fancyLog('Running global setup...', 100, 'gray', '');
  
  try {
    // Set permalink structure via WP-CLI (runs before browser is created)
    const permalinkStructure = '/%postname%/';
    utils.fancyLog(`🔗 Setting permalink structure to: ${permalinkStructure}`, 100, 'gray', '');
    
    execSync(`npx wp-env run cli wp option update permalink_structure '${permalinkStructure}'`, {
      cwd: pluginRoot,
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    
    // Flush rewrite rules to apply the new permalink structure
    utils.fancyLog('🔄 Flushing rewrite rules...', 100, 'gray', '');
    execSync('npx wp-env run cli wp rewrite flush', {
      cwd: pluginRoot,
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    // remove extra plugins for faster cleaner tests
    var extraPlugins = [
      'google-analytics-for-wordpress/googleanalytics.php',
      'jetpack/jetpack.php',
      'optinmonster/optin-monster-wp-api.php',
      'wpforms-lite/wpforms.php',
      'wordpress-seo/wp-seo.php',
    ];
    for (const plugin of extraPlugins) {
      // These companion plugins come pre-activated in the shared brand-plugin
      // build. `wp plugin delete` silently declines to remove an active
      // plugin, so without deactivating first, delete is a no-op and the
      // plugin stays loaded (and running its own hooks) for the entire
      // ~150-test combined suite. That compounds memory usage across the run
      // until PHP's memory_limit is exhausted partway through (see fatals in
      // wp-content/debug.log), causing unrelated later tests to see broken
      // pages that never finish rendering.
      await wordpress.wpCli(`plugin deactivate ${plugin}`, {
        failOnNonZeroExit: false,
      });
      // Awaited so cleanup finishes deleting plugins before tests start.
      await wordpress.wpCli(`plugin delete ${plugin}`, {
        failOnNonZeroExit: false,
      });
    }

    utils.fancyLog('✔ Global setup completed successfully', 100, 'green', '');
  } catch (error) {
    utils.fancyLog(`✘ Global setup failed: ${error.message}`, 100, 'red', '');
    process.exit(1);
  }
}

export default globalSetup;
