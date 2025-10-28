const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VENDOR_DIR = 'vendor/newfold-labs';

function getLocalModules() {
  const localModules = [];
  try {
    if (fs.existsSync('composer.local.json')) {
      const composerLocal = JSON.parse(fs.readFileSync('composer.local.json', 'utf8'));
      if (composerLocal.repositories) {
        for (const repo of composerLocal.repositories) {
          if (repo.type === 'path' && repo.url && repo.url.includes('modules/')) {
            const moduleName = repo.url.split('/').pop();
            const resolvedPath = path.resolve(repo.url);
            // Correct path resolution if needed, based on the project's root
            const correctedPath = resolvedPath.replace('/wordpress/modules/', '/modules/');
            const playwrightDir = path.join(correctedPath, 'tests', 'playwright');
            if (fs.existsSync(playwrightDir)) {
              localModules.push({ name: moduleName, path: correctedPath });
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not read composer.local.json:', error.message);
  }
  return localModules;
}

function getVendorModules() {
  const vendorModules = [];
  try {
    const result = execSync(`find ${VENDOR_DIR} -maxdepth 2 -type d -name "wp-module-*"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    if (result.trim()) {
      const modulePaths = result.trim().split('\n');
      modulePaths.forEach(modulePath => {
        const moduleName = path.basename(modulePath);
        const playwrightDir = path.join(modulePath, 'tests', 'playwright');
        if (fs.existsSync(playwrightDir)) {
          vendorModules.push({ name: moduleName, path: modulePath });
        }
      });
    }
  } catch (error) {
    // No vendor directories found, continue
  }
  return vendorModules;
}

function generateProjects() {
  console.log('🔍 Playwright Projects Discovery:');
  const projects = [
    {
      name: 'plugin-tests',
      testDir: './tests/playwright/specs',
      testMatch: '**/*.spec.js',
    }
  ];

  const localModules = getLocalModules();
  const vendorModules = getVendorModules();
  const discoveredModules = new Set();

  // Add local modules first (they take precedence)
  localModules.forEach(module => {
    if (!discoveredModules.has(module.name)) {
      projects.push({
        name: `local-${module.name}`,
        testDir: module.path,
        testMatch: 'tests/playwright/**/*.spec.js',
      });
      discoveredModules.add(module.name);
    }
  });

  // Add vendor modules if no local version exists
  vendorModules.forEach(module => {
    if (!discoveredModules.has(module.name)) {
      projects.push({
        name: `vendor-${module.name}`,
        testDir: module.path,
        testMatch: 'tests/playwright/**/*.spec.js',
      });
      discoveredModules.add(module.name);
    }
  });

  console.log(`📁 Found ${projects.length} project(s):`);
  projects.forEach(p => {
    const type = p.name.startsWith('plugin') ? 'PLUGIN' : (p.name.startsWith('local') ? 'LOCAL' : 'VENDOR');
    console.log(`  - ${p.name} (${type}): ${p.testDir}`);
  });

  return projects;
}

function writeProjectsFile() {
  const projects = generateProjects();
  const projectsFile = 'playwright-projects.json';
  
  console.log(`\n📝 Writing projects to ${projectsFile}...`);
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
  console.log(`✅ Projects written to ${projectsFile}`);
  
  return projects;
}

// If this script is run directly, generate and write the projects file
if (require.main === module) {
  writeProjectsFile();
}

module.exports = { 
  generateProjects, 
  writeProjectsFile,
  getLocalModules,
  getVendorModules
};