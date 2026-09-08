# Backend (PHP)

## Entry points

- **`bluehost-wordpress-plugin.php`** – Main plugin file. Defines constants (`BLUEHOST_PLUGIN_VERSION`, `BLUEHOST_PLUGIN_DIR`, `BLUEHOST_BUILD_DIR`, etc.), prevents double load, runs PHP/WP compatibility checks, and loads NFD plugin compat (including deactivating legacy Newfold plugins). If `BURST_SAFETY_MODE` is set, it loads a simple UI and exits. Otherwise it requires **`bootstrap.php`**.
- **`bootstrap.php`** – Loads autoloaders, Google Site Kit integration, sets up the module container and context, configures the plugin updater and upgrade handler, then requires core `inc/` files. Admin-only logic (e.g. upgrades) runs only when `is_admin()`.

## Core PHP (`inc/`)

| File / directory | Role |
|------------------|------|
| **Admin.php** | Registers admin menu, enqueues scripts/styles, plugin action links, runtime data (via `Data::runtime()`), disables admin notices on plugin pages, handles language-change transient clearing. |
| **Data.php** | Runtime data for the app (included when building runtime in Admin). Can include helpers like `is_sales_promotions_plugin_active()` for menu items. |
| **RestApi/rest-api.php** | Registers REST API controllers on `rest_api_init`. See [api.md](api.md) for endpoints. |
| **RestApi/SettingsController.php** | Implements `/bluehost/v1/settings` (see [api.md](api.md)). |
| **upgrades/** | Versioned upgrade routines (e.g. `2.0.php`, `4.7.2.php`). Executed by `WP_Forge\UpgradeHandler\UpgradeHandler` when stored version &lt; current plugin version. |
| **LoginRedirect.php** | Customizes login redirect behavior. |
| **GoogleSiteKit.php** | Google Site Kit integration (see [integrations.md](integrations.md)). |
| **YoastAI.php** | Yoast AI integration (see [integrations.md](integrations.md)). |
| **Filters.php** | Global filters (e.g. Hiive API headers); `Filters::init()` is called from bootstrap. See [integrations.md](integrations.md). |
| **settings.php**, **updates.php**, **base.php** | Settings, update checks, and base helpers (e.g. install date, setup). |
| **jetpack.php**, **partners.php** | Jetpack and partner integrations (see [integrations.md](integrations.md)). |
| **AutoIncrement.php** | DB healthcheck: fixes missing `AUTO_INCREMENT` on WordPress tables (used by support/tooling). |
| **AppWhenOutdated.php** | Fallback HTML view when the WordPress version is too old to run the React app (shows “WordPress Update Required”). |
| **plugin-php-compat-check.php**, **plugin-nfd-compat-check.php** | PHP/WP version checks and NFD plugin conflict handling. |
| **simple-ui/** | Minimal UI when `BURST_SAFETY_MODE` is enabled (see [reference.md](reference.md#safety-mode-and-simple-ui)). |
| **widgets/** | WordPress dashboard widgets: Account, Help, SitePreview (bootstrap in `widgets/bootstrap.php`). |

REST API endpoints are documented in **[api.md](api.md)** so they stay easy to find. Add new routes there when you add controllers.

## Updater

- **`WP_Forge\WPUpdateHandler\PluginUpdater`** is configured in `bootstrap.php` with a custom endpoint (Hiive release API).
- Endpoint pattern: `https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost?slug=bluehost-wordpress-plugin&file=bluehost-wordpress-plugin.php`.
- Data mapping and overrides (banners, icons, etc.) are set on the updater so WordPress shows the correct update info in the Plugins screen. The plugin does not use WordPress.org for updates.

## Upgrades

- **UpgradeHandler** is given the path to `inc/upgrades`, the last stored version (e.g. `get_option('bluehost_plugin_version', '0.1.0')`), and `BLUEHOST_PLUGIN_VERSION`.
- If stored version is lower, it runs matching upgrade files (by version) and then updates `bluehost_plugin_version` so they do not run again.
- Add new upgrade files when a release needs a one-time data or option migration.

## Activation

- On activation, an option (e.g. `nfd_activated_fresh`) is set so that on the next admin load, transients (e.g. `newfold_marketplace`, `newfold_notifications`, `newfold_solutions`, `nfd_site_capabilities`) are cleared and rewrite rules flushed. See `on_activate()` and `load_plugin()` in `bootstrap.php`.
