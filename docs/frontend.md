# Frontend (React admin app)

## Stack and tooling

- **React** with **React Router** for routing.
- **State:** Context-based app store (see `src/app/data/store.js`); settings and feature flags are loaded from the REST API and merged with `window.NewfoldFeatures`.
- **UI:** `@wordpress/components`, `@newfold/ui-component-library`, and Heroicons where used.
- **Build:** `@wordpress/scripts` (webpack) with project-specific config. Path aliases include `App`, `Assets`, `Store`, `Routes`, `@modules`. Globals like `useState`, `useEffect`, `__` are provided via webpack so many files don’t need to import them.

## Directory layout

| Path | Purpose |
|------|---------|
| `src/app/pages/` | Page components: Home, Settings, Commerce, Marketplace, Help, Admin, Store (e.g. sales_discounts). |
| `src/app/components/` | Reusable UI (e.g. icons, shared layout). |
| `src/app/data/` | Routes (`routes.js`), store (`store.js`), and related data/API helpers. |
| `src/app/util/` | Helpers and custom hooks. |

## Routes

Routes are defined in **`src/app/data/routes.js`** and rendered with React Router’s `<Routes>` / `<Route>`.

Main route names and targets:

- `/` → Home
- `/home` → Home
- `/settings`, `/settings/settings`, `/settings/staging`, `/settings/performance` → Settings (some paths redirect to module pages)
- `/commerce` → Commerce (solutions)
- `/marketplace` → Marketplace (with optional subnav from the marketplace module)
- `/store/sales_discounts` → Store sales/promotions
- `/help` → Help (can open embedded help when enabled)
- `/admin` → Admin (hidden feature-flag toggles; see [Feature toggles on the Admin page](#feature-toggles-on-the-admin-page))

Redirects (full-page):

- `/my_plugins_and_tools` → commerce with `category=all`
- `/staging` → `admin.php?page=nfd-staging`
- `/performance` → `admin.php?page=nfd-performance`
- `/hosting` → `admin.php?page=nfd-hosting`

Routes can have a `condition` so they only render when allowed; the Help route may trigger `window.newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp()` instead of normal navigation when the help center is enabled.

## Store and runtime

- **App store** (`src/app/data/store.js`): Fetches `/bluehost/v1/settings` and merges result with `window.NewfoldFeatures` (features, togglable). Exposes `store`, `setStore`, `booted`, `hasError` via context.
- **Runtime:** `window.NewfoldRuntime` (and related) is set by the PHP side and provides admin URL, API URL builder, capabilities, etc. The app uses it for links and API calls (e.g. `NewfoldRuntime.createApiUrl('/bluehost/v1/settings')`).

## Feature toggles on the Admin page

The hidden Admin route (`#/admin`) exposes toggles for registered Newfold feature flags. Toggles are rendered only when the flag exists in `store.features` (sourced from `window.NewfoldFeatures` at boot). Use the shared **`FeatureToggle`** component (`src/app/components/FeatureToggle.js`) for new toggles; it handles API calls via `featureToggle()`, updates `store.features.{key}`, and shows success/error notifications. This should at some point be updated to use a portal so modules can add their own toggle (and tests).

| Feature key | Module | Admin toggle | Purpose |
|-------------|--------|--------------|---------|
| `staging` | `wp-module-staging` | Staging | Enables the staging environment for testing updates before going live |
| `performance` | `wp-module-performance` | Performance | Enables performance and caching features in the admin navigation |
| `tenwebAdminRestrictions` | `wp-module-10web` | 10Web Admin Restrictions | Locks theme switching and plugin access on WVC editor sites |
| `tenwebEditorSupport` | `wp-module-10web` | 10Web Editor Support | Loads PostHog session replay on the WVC editor screen |

Thin wrappers in `src/app/pages/admin/` and `src/app/pages/settings/` pass localized labels, notice copy, and optional nav `selectors` into `FeatureToggle`. Disable a flag locally with WP-CLI (e.g. `wp newfold features disable staging`) or a module-specific PHP filter.

## Build output

- **Output directory:** `build/<version>/` (e.g. `build/4.14.1/`). Version comes from `package.json`.
- **Artifacts:** `index.js`, `index.css`, and optionally `portal-registry.js` (or similar) for module portals. An `index.asset.php` (or equivalent) manifest lists script dependencies and a version hash for cache busting.
- The PHP admin code enqueues the script using this path and the manifest; see `inc/Admin.php`.

## Development

- `npm run start` – Dev server with hot reload.
- `npm run build` – Production build.
- `npm run start:analyzer` – Build with bundle analyzer.

Ensure `package.json` version matches the plugin’s `BLUEHOST_PLUGIN_VERSION` so the correct `build/<version>/` folder is used at runtime.
