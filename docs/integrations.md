# Integrations

This document describes how the Bluehost plugin integrates with third-party plugins, APIs, and partner services. For module-level features (e.g. marketplace, help center), see [modules.md](modules.md) and [architecture.md](architecture.md).

## Google Site Kit

- **File:** `inc/GoogleSiteKit.php`
- **Purpose:** When site capabilities are written to the `nfd_site_capabilities` transient, the plugin can enable the Google Site Kit feature in Yoast SEO options so that Bluehost customers get the feature flag in sync with the capabilities data.
- **Hook:** `pre_set_transient_nfd_site_capabilities` – adjusts the transient value so that if Google Site Kit is enabled in capabilities, `WPSEO_Options::google_site_kit_feature_enabled` is set to `true` when Yoast is present.

## Yoast SEO (Yoast AI)

- **File:** `inc/YoastAI.php`
- **Purpose:** Ensures the Yoast AI generator is enabled by default for Bluehost customers; adds a custom header to outbound Yoast AI API requests for Bluehost identification.
- **Hooks:**
  - Registers an activation hook on `wordpress-seo/wp-seo.php` to run `enable_on_new_activations`.
  - `wpseo_option_wpseo_defaults` – sets `enable_ai_generator` to `true` in Yoast defaults for new activations.
  - `http_request_args` – adds a Bluehost-specific header to requests to Yoast AI endpoints (when the request URL matches).

## Jetpack

- **File:** `inc/jetpack.php`
- **Purpose:** Customize which Jetpack modules and blocks are available when Jetpack is active.
- **Filters:**
  - `jetpack_get_default_modules` – adds `photon` and `sso` to the default enabled modules.
  - `jetpack_set_available_blocks` – removes `mailchimp` and `revue` from the available blocks so they are not enabled by default.

## Partners (affiliate and plugin behavior)

- **File:** `inc/partners.php`
- **Purpose:** Partner-specific affiliate links and behavior (e.g. WPForms, All-in-One SEO upgrade links; WooCommerce usage tracking on activation). Some filters are currently commented out while partner issues are resolved.
- **Notable behavior:**
  - **WooCommerce:** On activation of `woocommerce/woocommerce.php`, sets `woocommerce_allow_tracking` to `yes` so usage tracking can be enabled by default.
  - **WPForms / AIOSEO:** Affiliate upgrade link filters exist but are temporarily disabled (SaS issue).

## Hiive API requests (Filters)

- **File:** `inc/Filters.php`
- **Purpose:** Ensures outbound HTTP requests to the Hiive API include locale and host plugin identification for the backend.
- **Filter:** `http_request_args` – when the request URL contains `NFD_HIIVE_URL`, adds headers:
  - `X-WP-LOCALE` – current WordPress locale.
  - `X-HOST-PLUGIN-ID` – container plugin id (e.g. `bluehost`).

Defined in `bootstrap.php`; `Filters::init()` is called after the filter class is loaded.

## Adding or changing integrations

- Add new integration logic in `inc/` (or a new file if it’s a substantial integration) and require it from `bootstrap.php` if it must load early.
- Document new hooks and behavior here and in [backend.md](backend.md) if they add new entry points or config.
- When adding new HTTP headers or partner-specific behavior, consider feature flags or context (e.g. brand) so other Newfold brands can override or disable if needed.
