# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Bluehost WordPress Plugin integrates WordPress sites with the Bluehost control panel, providing performance, security, and update features. This is a brand plugin maintained by Newfold Labs that extends WordPress with custom admin pages, modules, and integrations.

## Build and Development Commands

### Development Workflow
```bash
# Install dependencies
npm install --legacy-peer-deps
composer install

# Start development server with hot reload
npm run start

# Build for production
npm run build

# Build for production with analyzer
npm run start:analyzer
```

### Testing
```bash
# Run Cypress e2e tests
npm run test:e2e

# Run unit tests
npm run test:unit

# Run specific Cypress test interactively
npm run cypress
```

### Linting and Code Quality
```bash
# Lint JavaScript
npm run lint:js

# Fix JavaScript linting issues
npm run lint:js:fix

# Lint CSS
npm run lint:css

# Lint PHP
composer run lint

# Fix PHP linting issues
composer run fix

# Lint YAML files
npm run lint:yml
```

### Internationalization (i18n)
```bash
# Generate all language files
composer run i18n
npm run i18n

# Generate POT file only
composer run i18n-pot

# Update PO files
composer run i18n-po

# Generate MO files
composer run i18n-mo

# Generate JSON files
composer run i18n-json
```

### Local Development Environment
```bash
# Start wp-env local WordPress instance
npx wp-env start

# Stop wp-env
npx wp-env stop

# Watch debug.log
npm run log:watch
```

### Release and Build
```bash
# Bump version (patch) and build
npm run set-version-bump

# Bump minor version and build
npm run set-version-minor

# Simulate CI runner build process
npm run simulate-runner-build
# or shorthand:
npm run srb

# Create distributable zip
npm run create:dev
```

## Architecture

### Module System

This plugin uses the **Newfold Module Loader** architecture. Modules are loaded via `bootstrap.php` and configured through the Container:

- **Container Setup**: `bootstrap.php` initializes `NewfoldLabs\WP\ModuleLoader\Container` and sets plugin metadata
- **Module Loading**: Modules are Composer dependencies (e.g., `newfold-labs/wp-module-*`) that automatically register with the container
- **Context System**: Uses `NewfoldLabs\WP\Context` to set brand context (always 'bluehost') and platform-specific overrides

Key modules include:
- `wp-module-performance` - Performance optimization features
- `wp-module-coming-soon` - Coming soon page functionality
- `wp-module-ecommerce` - E-commerce integrations
- `wp-module-marketplace` - Plugin/theme marketplace
- `wp-module-staging` - Staging environment management
- `wp-module-onboarding` - New site onboarding flows

### Frontend Architecture

The admin interface is a React single-page application built with:

- **React Router** for routing (`src/app/data/routes.js`)
- **Redux Toolkit** for state management (`src/app/data/store.js`)
- **WordPress Components** from `@wordpress/components`
- **Newfold UI Component Library** (`@newfold/ui-component-library`)

**Key directories:**
- `src/app/pages/` - Page components (Home, Settings, Commerce, Marketplace, Help)
- `src/app/components/` - Reusable UI components
- `src/app/data/` - Redux store and route definitions
- `src/app/util/` - Helper functions and custom hooks

**Webpack Configuration:**
- Uses `@wordpress/scripts` as base with custom overrides
- Output is versioned by package.json version (e.g., `build/4.7.0/`)
- Path aliases configured: `App`, `Assets`, `Store`, `Routes`, `@modules`
- Common imports auto-provided via ProvidePlugin (useState, useEffect, __, etc.)

### Backend Architecture

**Entry Points:**
- `bluehost-wordpress-plugin.php` - Main plugin file with header and version constants
- `bootstrap.php` - Loads dependencies, initializes container, and requires core files

**Core PHP:**
- `inc/Admin.php` - Registers admin menu, enqueues assets, manages subnav
- `inc/RestApi/` - REST API endpoints
- `inc/upgrades/` - Version upgrade routines (executed via `WP_Forge\UpgradeHandler`)
- `inc/widgets/` - Custom WordPress widgets
- `inc/Data.php` - Runtime data configuration
- `inc/LoginRedirect.php` - Login flow customization
- `inc/GoogleSiteKit.php` - Google Site Kit integration

**Update System:**
- Uses `WP_Forge\WPUpdateHandler\PluginUpdater` to check custom update endpoint
- Pulls updates from: `https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost`

### Routing and Navigation

React Router handles frontend navigation with these main routes:
- `/home` - Dashboard home page
- `/settings` - WordPress management settings (with sub-routes for staging, performance)
- `/commerce` - Commerce/solutions page
- `/marketplace` - Plugin/theme marketplace
- `/store` - Store configuration (products, payments, details)
- `/help` - Help resources

Special redirects exist for legacy routes (e.g., `/my_plugins_and_tools` → `/commerce`)

Portal apps are mounted to separate divs for module isolation:
- `nfd-coming-soon-portal`
- `nfd-next-steps-portal`
- `nfd-performance-portal`
- `nfd-staging-portal`

### Version Management

**Three locations must be synchronized:**
1. Plugin header in `bluehost-wordpress-plugin.php` (line 15)
2. `BLUEHOST_PLUGIN_VERSION` constant in `bluehost-wordpress-plugin.php` (line 35)
3. `package.json` version field (line 3)

Use `npm run set-version-bump` to update all three automatically.

## Development Notes

### Plugin Compatibility Checks

The plugin includes compatibility checks in `bluehost-wordpress-plugin.php`:
- Prevents multiple instances from loading
- Requires PHP 7.3+ and WordPress 6.6+
- Deactivates legacy Newfold plugins (MOJO, HostGator, Web.com, Crazy Domains)
- Safety mode support via `BURST_SAFETY_MODE` constant

### Cache and Transients

Key transients used:
- `newfold_marketplace` - Marketplace data cache
- `newfold_notifications` - Notifications cache
- `newfold_solutions` - Solutions data cache
- `nfd_site_capabilities` - Site capabilities cache

These are cleared on plugin activation and language changes.

### Platform Detection

The plugin adapts behavior based on platform context:
- Standard Bluehost hosting uses full cache types (`browser`, `skip404`)
- Atomic platform (cloud) disables certain cache types and uses `bluehost-cloud` marketplace brand

### WordPress Environment Configuration

`.wp-env.json` configures local WordPress environment:
- WordPress 6.8.3
- PHP 8.1
- Port 8882 (development), 8883 (tests)
- Pre-installs: wpforms-lite plugin, yith-wonder theme

### Cypress Testing

Test configuration in `cypress.config.js`:
- Project ID: 71eo94
- Tests located in `tests/cypress/integration/`
- Module tests included from `vendor/newfold-labs/**/tests/cypress/integration/`
- Conditional test exclusion based on WordPress/PHP version compatibility
- Some tests excluded by default (e.g., ecommerce, onboarding)

### Build Output

Build artifacts are versioned and gitignored:
- `build/` directory contains version-specific subdirectories
- Each build includes `index.js`, `index.css`, `portal-registry.js`
- Asset manifest file (`index.asset.php`) contains dependencies and version hash

### Figma Design Reference

UI designs available at: https://www.figma.com/file/pNcxXb2avx36YAWOD1XkgZ/Bluehost-Project-SP

## Release Process

**Standard Process:**
1. Ensure `develop` branch is up-to-date
2. Create release branch: `release/X.Y.Z` from `develop`
3. Bump version using `npm run set-version-bump` (or `--minor`)
4. Tag pre-release: `X.Y.Z-rc.1`
5. Run full test suite and manual testing
6. Merge to `main` (and back-merge changes to `develop`)
7. Tag final release: `X.Y.Z` (not marked as pre-release)
8. Verify satis build triggers and update API reflects new version

**Pre-release versions:**
- Alpha: `X.Y.Z-alpha.N` - open to new features and bug fixes
- Beta: `X.Y.Z-beta.N` - bug fixes only
- RC: `X.Y.Z-rc.N` - release candidates for final testing

## Special Considerations

- Admin notices are disabled on plugin pages to reduce visual clutter
- Custom admin menu icon uses base64-encoded SVG
- First submenu item is hidden via CSS (WordPress auto-adds duplicate)
- Admin bar shows yellow "Coming Soon Active" notice when enabled
- The plugin handles its own updates independently of WordPress.org
- Upgrade routines are version-based and stored in `inc/upgrades/` directory