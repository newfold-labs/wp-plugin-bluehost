import { execFileSync, execSync } from 'child_process';
import { dirname, join } from 'path';
import utils from './helpers/utils.mjs';
import wordpress from './helpers/wordpress.mjs';

function runApplyPlaywrightModuleOverrides(config) {
  const pluginRoot =
    config.configFile && config.configFile.length > 0
      ? dirname(config.configFile)
      : (config.rootDir || process.cwd());
  const script = join(pluginRoot, '.github/scripts/apply-playwright-module-overrides.mjs');
  // No shell: argv only, so path characters are not interpreted by a shell
  execFileSync(process.execPath, [script], { cwd: pluginRoot, stdio: 'inherit' });
}

async function globalSetup(config) {
  // Apply module spec overrides (separate process; see runApplyPlaywrightModuleOverrides)
  runApplyPlaywrightModuleOverrides(config);

  utils.fancyLog('Running global setup...', 100, 'gray', '');
  
  try {
    // Set permalink structure via WP-CLI (runs before browser is created)
    const permalinkStructure = '/%postname%/';
    utils.fancyLog(`🔗 Setting permalink structure to: ${permalinkStructure}`, 100, 'gray', '');
    
    execSync(`npx wp-env run cli wp option update permalink_structure '${permalinkStructure}'`, {
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    
    // Flush rewrite rules to apply the new permalink structure
    utils.fancyLog('🔄 Flushing rewrite rules...', 100, 'gray', '');
    execSync('npx wp-env run cli wp rewrite flush', {
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
      wordpress.wpCli(`plugin delete ${plugin}`, {
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
