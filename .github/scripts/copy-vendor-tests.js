#!/usr/bin/env node

/**
 * Copy Playwright test files from vendor modules to the main test directory
 * This script finds all Playwright test files in vendor modules and copies them
 * to the main tests/playwright/specs directory with proper namespacing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VENDOR_DIR = 'vendor/newfold-labs';
const TARGET_DIR = 'tests/playwright/specs/newfold-labs';
const TEST_PATTERNS = [
  '**/tests/playwright/specs/**/*.spec.js',
  '**/tests/e2e/specs/**/*.spec.js'
];

function findTestFiles() {
  const testFiles = [];
  
  try {
    // Find only Playwright test files, excluding node_modules
    const result = execSync(`find ${VENDOR_DIR} -name "*.spec.js" -path "*/tests/*" -not -path "*/node_modules/*"`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      const files = result.trim().split('\n');
      
      // Filter to only include files that look like Playwright tests
      for (const file of files) {
        if (isPlaywrightTestFile(file)) {
          testFiles.push(file);
        }
      }
    }
  } catch (error) {
    // No files found, continue
  }
  
  return testFiles;
}

function isPlaywrightTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's a Playwright test by looking for common patterns
    const isPlaywrightTest = 
      content.includes('@playwright/test') ||
      content.includes('require(\'@playwright/test\')') ||
      content.includes('test.describe') ||
      content.includes('test(') ||
      content.includes('expect(');
    
    // Exclude files that are clearly not Playwright tests
    const isNotPlaywrightTest = 
      content.includes('require(\'../../lib/') ||
      content.includes('require(\'../../../lib/') ||
      content.includes('const { parse, inspect }') ||
      content.includes('const { default: getParser }');
    
    return isPlaywrightTest && !isNotPlaywrightTest;
  } catch (error) {
    return false;
  }
}

function copyTestFile(sourcePath) {
  const relativePath = path.relative(VENDOR_DIR, sourcePath);
  const moduleName = relativePath.split('/')[0];
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(TARGET_DIR, moduleName, fileName);
  
  // Create target directory
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copy file
  fs.copyFileSync(sourcePath, targetPath);
  
  console.log(`Copied: ${sourcePath} -> ${targetPath}`);
  return targetPath;
}

function main() {
  console.log('🔍 Searching for Playwright test files in vendor modules...');
  
  const testFiles = findTestFiles();
  
  if (testFiles.length === 0) {
    console.log('✅ No Playwright test files found in vendor modules');
    return;
  }
  
  console.log(`📁 Found ${testFiles.length} test file(s):`);
  testFiles.forEach(file => console.log(`  - ${file}`));
  
  // Clean target directory
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  
  // Copy files
  const copiedFiles = [];
  for (const testFile of testFiles) {
    if (fs.existsSync(testFile)) {
      const copiedPath = copyTestFile(testFile);
      copiedFiles.push(copiedPath);
    }
  }
  
  console.log(`\n✅ Successfully copied ${copiedFiles.length} test file(s) to ${TARGET_DIR}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
