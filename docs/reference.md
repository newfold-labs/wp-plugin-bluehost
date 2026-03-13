# Reference

## Cache and transients

The plugin uses WordPress transients for cached data. Important keys:

- **`newfold_marketplace`** – Marketplace data
- **`newfold_notifications`** – Notifications
- **`newfold_solutions`** – Solutions data
- **`nfd_site_capabilities`** – Site capabilities

These are cleared on plugin activation and when the site language changes (`update_option_WPLANG`). If you add new transients that should be cleared on activate or language change, add them in `on_activate()` and in the `clear_transient_on_language_change` logic in `inc/Admin.php` (or equivalent).

## Platform detection

Behavior can differ by hosting platform:

- **Standard Bluehost:** Full cache types (e.g. `browser`, `skip404`) and default marketplace brand (`bluehost`) are typical.
- **Atomic (cloud):** Some cache types may be disabled and marketplace brand may be overridden to `bluehost-cloud` via filters.

Filters such as `newfold/container/cache_types` and `newfold/container/marketplace_brand` are applied in `bootstrap.php` on `plugins_loaded` so host-specific code can override defaults without changing the plugin core.

## Compatibility

- **PHP:** 7.4 minimum (plugin header may say 7.3 in some compat check; 7.4 is the practical requirement). Local wp-env often uses 8.1.
- **WordPress:** 6.6 minimum; “Tested up to” is set in the plugin header (e.g. 6.9.1).
- **Legacy plugins:** When this plugin is active, it can deactivate other Newfold brand plugins (MOJO, HostGator, Web.com, Crazy Domains) to avoid conflicts. Configuration is in the main plugin file via `plugin-nfd-compat-check.php`.

## Safety mode and simple UI

If **`BURST_SAFETY_MODE`** is defined and true (e.g. by the host or another plugin), the main plugin file loads only **`inc/simple-ui/init.php`** and returns; the full bootstrap, module loader, and React app are not loaded. Simple UI adds a single “Bluehost” admin menu item that renders a minimal static page (from `inc/simple-ui/index.html`) and enqueues the main build CSS. The behavior is intended for environments where the full app cannot run safely. The performance module’s Burst Safety Mode logic can set this constant; see `vendor/newfold-labs/wp-module-performance` for that integration.

## Admin UX details

- Admin notices are disabled on the plugin’s admin pages to reduce clutter.
- The first submenu item under the Bluehost menu may be hidden via CSS (WordPress adds a duplicate of the main menu title).
- When Coming Soon is active, the admin bar can show a “Coming Soon Active” notice (e.g. yellow bar).
- Custom admin menu icon is typically a base64-encoded SVG.

## Design and assets

- **Figma:** UI design reference – [Bluehost Project SP](https://www.figma.com/file/pNcxXb2avx36YAWOD1XkgZ/Bluehost-Project-SP).
- **Assets:** Plugin assets (e.g. SVG, styles) live under `assets/` (e.g. `assets/svg/`, `assets/styles/`). Coming Soon template styles are enqueued from the plugin (e.g. `assets/styles/coming-soon.css`).

## Update system

- The plugin handles its own updates independently of WordPress.org. It uses **WP_Forge WPUpdateHandler PluginUpdater** with a custom endpoint (Hiive release API).
- Endpoint URL pattern: `https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost?...`.
- Banners and icons for the Plugins screen can be overridden in the updater config in `bootstrap.php`.

## E2E and module tests

- **Playwright** is the primary E2E runner (`npm run test:e2e` / `npm run test:playwright`). **Cypress** may still be used for interactive runs (`npm run cypress`) and in **deploy-and-test** against the deployed site.
- For full details on Playwright, PHPUnit, WPUnit, and their CI workflows, see **[testing.md](testing.md)** and **[workflows.md](workflows.md)**.
