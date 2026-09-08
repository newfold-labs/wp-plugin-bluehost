# Overview

## What the plugin does

The **Bluehost WordPress Plugin** connects a WordPress site to the Bluehost control panel. It provides:

- **Performance** – Caching and optimization (via the performance module).
- **Security and updates** – Update checks and management (custom update endpoint, not WordPress.org).
- **Admin experience** – A React-based admin app with pages for Home, Manage WordPress (Settings), Commerce (solutions), Marketplace, Store, and Help.
- **Module features** – Coming Soon page, staging, onboarding, e-commerce integrations, and plugin/theme marketplace, delivered through the Newfold Module Loader.

Sites get a single “Bluehost” entry in the WordPress admin menu; the plugin’s UI lives under that menu as a client-side app.

## Who maintains it

- **Newfold Labs** (Newfold Digital) maintains the plugin.
- **Brand context** for this repo is always **Bluehost**; other Newfold brands (e.g. HostGator, MOJO, Web.com, Crazy Domains) use their own plugin repos. This plugin deactivates those legacy plugins when active to avoid conflicts.

## High-level feature set

- **Dashboard (Home)** – Overview and quick actions.
- **Manage WordPress (Settings)** – WordPress management, with sub-areas for staging and performance (often via redirects to module-specific admin pages).
- **Commerce** – Solutions/commerce hub (legacy route `my_plugins_and_tools` redirects here).
- **Marketplace** – Browse and manage plugins/themes from the Newfold marketplace.
- **Store** – Store configuration (e.g. sales/promotions); WooCommerce integration when applicable.
- **Help** – Help resources and embedded help (when the help center feature is enabled).
- **Modules** – Coming Soon, Staging, Performance, Onboarding, E-commerce, etc., are provided by Composer packages and register with the plugin’s container.

The plugin requires **PHP 7.4+** and **WordPress 6.6+**, and uses a custom update server (Hiive/release API) rather than WordPress.org for updates.
