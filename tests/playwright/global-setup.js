import { execSync } from 'child_process';
import { fancyLog } from './helpers/utils.js';

async function globalSetup(config) {
  fancyLog('Running global setup...', 55, 'gray', '');
  
  try {
    // Set permalink structure via WP-CLI (runs before browser is created)
    const permalinkStructure = '/%postname%/';
    fancyLog(`🔗 Setting permalink structure to: ${permalinkStructure}`, 55, 'gray', '');
    
    execSync(`npx wp-env run cli wp option update permalink_structure '${permalinkStructure}'`, {
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    
    // Flush rewrite rules to apply the new permalink structure
    fancyLog('🔄 Flushing rewrite rules...', 55, 'gray', '');
    execSync('npx wp-env run cli wp rewrite flush', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    
    fancyLog('✔ Global setup completed successfully', 55, 'green', '');
  } catch (error) {
    fancyLog(`✘ Global setup failed: ${error.message}`, 55, 'red', '');
    process.exit(1);
  }
}

export default globalSetup;
