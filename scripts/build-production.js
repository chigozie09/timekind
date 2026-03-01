#!/usr/bin/env node

/**
 * Production Build Script for TimeKind
 * 
 * Handles versioning, building, and submission to app stores
 * 
 * Usage:
 *   node scripts/build-production.js [options]
 * 
 * Options:
 *   --platform ios|android|all    Platform to build for (default: all)
 *   --version X.Y.Z               Set version (default: auto-increment patch)
 *   --submit                      Auto-submit to app stores
 *   --dry-run                      Show what would be done without executing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  platform: 'all',
  version: null,
  submit: false,
  dryRun: false,
};

args.forEach((arg) => {
  if (arg === '--submit') options.submit = true;
  if (arg === '--dry-run') options.dryRun = true;
  if (arg.startsWith('--platform=')) options.platform = arg.split('=')[1];
  if (arg.startsWith('--version=')) options.version = arg.split('=')[1];
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Read app.config.ts
const appConfigPath = path.join(__dirname, '../app.config.ts');
const appConfigContent = fs.readFileSync(appConfigPath, 'utf-8');

// Parse current version
let currentVersion = packageJson.version;
let [major, minor, patch] = currentVersion.split('.').map(Number);

// Handle version
if (options.version) {
  currentVersion = options.version;
  [major, minor, patch] = currentVersion.split('.').map(Number);
} else {
  // Auto-increment patch version
  patch += 1;
  currentVersion = `${major}.${minor}.${patch}`;
}

log('\n🚀 TimeKind Production Build', 'bright');
log('═'.repeat(50));

info(`Current version: ${packageJson.version}`);
info(`Building version: ${currentVersion}`);
info(`Platform: ${options.platform}`);
if (options.submit) info('Auto-submit: enabled');
if (options.dryRun) warn('DRY RUN MODE - no changes will be made');

// Step 1: Update version
log('\n📦 Step 1: Update Version', 'bright');
log('─'.repeat(50));

if (!options.dryRun) {
  packageJson.version = currentVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  success(`Updated package.json to version ${currentVersion}`);
} else {
  info(`Would update package.json to version ${currentVersion}`);
}

// Step 2: Run tests
log('\n🧪 Step 2: Run Tests', 'bright');
log('─'.repeat(50));

if (!options.dryRun) {
  try {
    execSync('npm test', { stdio: 'inherit' });
    success('All tests passed');
  } catch (err) {
    error('Tests failed. Fix errors before building.');
  }
} else {
  info('Would run: npm test');
}

// Step 3: Build for platforms
log('\n🏗️  Step 3: Build for Platforms', 'bright');
log('─'.repeat(50));

const platforms = options.platform === 'all' ? ['ios', 'android'] : [options.platform];

platforms.forEach((platform) => {
  const buildCommand = `eas build --platform ${platform} --profile production --non-interactive --wait`;
  
  if (!options.dryRun) {
    try {
      info(`Building for ${platform}...`);
      execSync(buildCommand, { stdio: 'inherit' });
      success(`${platform.toUpperCase()} build completed`);
    } catch (err) {
      error(`Failed to build for ${platform}`);
    }
  } else {
    info(`Would run: ${buildCommand}`);
  }
});

// Step 4: Upload app store content
log('\n📱 Step 4: Upload App Store Content', 'bright');
log('─'.repeat(50));

const uploadCommand = 'npm run upload:app-store-content';

if (!options.dryRun) {
  try {
    info('Uploading localized app store content...');
    execSync(uploadCommand, { stdio: 'inherit' });
    success('App store content uploaded');
  } catch (err) {
    warn('App store content upload failed (non-critical)');
  }
} else {
  info(`Would run: ${uploadCommand}`);
}

// Step 5: Submit to app stores
if (options.submit) {
  log('\n🚢 Step 5: Submit to App Stores', 'bright');
  log('─'.repeat(50));

  platforms.forEach((platform) => {
    const submitCommand = `eas submit --platform ${platform} --latest --non-interactive`;
    
    if (!options.dryRun) {
      try {
        info(`Submitting ${platform} build to app store...`);
        execSync(submitCommand, { stdio: 'inherit' });
        success(`${platform.toUpperCase()} submitted to app store`);
      } catch (err) {
        warn(`Failed to submit ${platform} (you can submit manually)`);
      }
    } else {
      info(`Would run: ${submitCommand}`);
    }
  });
}

// Step 6: Create git tag
log('\n🏷️  Step 6: Create Git Tag', 'bright');
log('─'.repeat(50));

const tagCommand = `git tag v${currentVersion}`;
const pushCommand = `git push origin v${currentVersion}`;

if (!options.dryRun) {
  try {
    execSync(tagCommand);
    info(`Created git tag v${currentVersion}`);
    
    if (process.env.CI) {
      // In CI environment, push the tag
      execSync(pushCommand);
      success('Pushed tag to repository');
    } else {
      info('Run this to push the tag:');
      info(`  ${pushCommand}`);
    }
  } catch (err) {
    warn('Failed to create git tag (non-critical)');
  }
} else {
  info(`Would run: ${tagCommand}`);
  info(`Would run: ${pushCommand}`);
}

// Summary
log('\n📊 Build Summary', 'bright');
log('═'.repeat(50));

const summary = {
  'Version': currentVersion,
  'Platforms': platforms.join(', '),
  'Tests': options.dryRun ? 'Would run' : 'Passed',
  'App Store Content': options.dryRun ? 'Would upload' : 'Uploaded',
  'Submit to Stores': options.submit ? 'Yes' : 'No',
  'Dry Run': options.dryRun ? 'Yes' : 'No',
};

Object.entries(summary).forEach(([key, value]) => {
  console.log(`  ${key.padEnd(20)} ${value}`);
});

log('\n' + '═'.repeat(50));

if (options.dryRun) {
  warn('This was a DRY RUN. No changes were made.');
  info('Run without --dry-run to execute the build.');
} else {
  success('Production build completed successfully!');
  
  log('\n📋 Next Steps:', 'bright');
  log('  1. Review the build in EAS Dashboard');
  log('  2. Test the app on a device');
  log('  3. Review app store listings');
  if (!options.submit) {
    log('  4. Submit to app stores manually or re-run with --submit');
  } else {
    log('  4. Monitor app store review status');
  }
}

log('\n');
