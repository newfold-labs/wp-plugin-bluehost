import { execSync } from 'child_process';
import utils from './helpers/utils.mjs';
import wordpress from './helpers/wordpress.mjs';

async function globalSetup(config) {
  utils.fancyLog('Running global setup...', 55, 'gray', '');
  
  try {
    // Set permalink structure via WP-CLI (runs before browser is created)
    const permalinkStructure = '/%postname%/';
    utils.fancyLog(`🔗 Setting permalink structure to: ${permalinkStructure}`, 55, 'gray', '');
    
    execSync(`npx wp-env run cli wp option update permalink_structure '${permalinkStructure}'`, {
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    
    // Flush rewrite rules to apply the new permalink structure
    utils.fancyLog('🔄 Flushing rewrite rules...', 55, 'gray', '');
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

    utils.fancyLog('✔ Global setup completed successfully', 55, 'green', '');
  } catch (error) {
    utils.fancyLog(`✘ Global setup failed: ${error.message}`, 55, 'red', '');
    process.exit(1);
  }
}

export default globalSetup;
