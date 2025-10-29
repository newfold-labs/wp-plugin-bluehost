const { execSync } = require('child_process');

async function globalSetup(config) {
  console.log('Running global setup...');
  
  try {
    // Add your command here
    // Example: execSync('npm run build', { stdio: 'inherit' });
    // Example: execSync('wp-env run cli wp plugin activate your-plugin', { stdio: 'inherit' });
    
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error.message);
    process.exit(1);
  }
}

module.exports = globalSetup;
