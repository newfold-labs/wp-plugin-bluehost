# PHP-Scoper namespace prefixing

This plugin bundles Composer packages that other plugins may also ship. To avoid class collisions, those packages are copied into `vendor-prefixed/` with their namespaces prefixed. For example, WooCommerce bundles its own copy of `wordpress/mcp-adapter`; ours is prefixed to `Bluehost\Plugin\WP\MCP\*` so the two can coexist.

Prefixing is done with [PHP-Scoper](https://github.com/humbug/php-scoper). It replaced [Strauss](https://github.com/BrianHenryIE/strauss) in PRESS0-4774 after repeated Strauss-related CI failures (PRESS0-4251, PRESS0-4580). PHP-Scoper is the same tool the Bluehost-branded YITH plugins (`wp-plugin-subscriptions`, `wp-plugin-memberships`) use.

## How it works

- `composer install` and `composer update` run the `prefix-namespaces` script, which:
  1. `ensure-scoper`: installs PHP-Scoper into `bin/php-scoper/` from its own `composer.json`. This keeps PHP-Scoper (which needs PHP 8.2+ and has its own dependency tree) out of the plugin's dependencies, and available on `--no-dev` installs.
  2. `scoper-run`: runs PHP-Scoper once per bundled package with an explicit input path and output directory. Output lands in `vendor-prefixed/<vendor>/<package>/`.
  3. `composer dump-autoload`: refreshes the autoloader.
- `scoper.inc.php` holds the shared scoping policy: the `Bluehost\Plugin` prefix and the symbols that must not be prefixed (WordPress core symbols via `sniccowp/php-scoper-wordpress-excludes`, plus WP-CLI).
- The prefixed classes are autoloaded through PSR-4 entries in the plugin's `composer.json` `autoload` section. There is no separate autoloader in `vendor-prefixed/` and no autoloader patching.
- `vendor-prefixed/` is gitignored and regenerated on every install. It ships in the release artifact.
- The original, unprefixed packages remain in `vendor/`, matching previous behavior.

Currently prefixed packages:

| Package | Prefixed namespace | Consumer |
|---------|--------------------|----------|
| `wordpress/mcp-adapter` | `Bluehost\Plugin\WP\MCP\` | `newfold-labs/wp-module-mcp` |
| `wordpress/php-mcp-schema` | `Bluehost\Plugin\WP\McpSchema\` | `wordpress/mcp-adapter` |

## PHP version requirements

PHP-Scoper requires PHP 8.2+ to run. The scoped output is unaffected: it stays as compatible as the input (the plugin's platform config pins dependency resolution to PHP 7.4).

- Local development: use PHP 8.2 or newer to run `composer install`.
- CI: workflows that run `composer install` use PHP 8.3. The shared translations and prep-release workflows in `newfold-labs/workflows` run on 8.3 directly. The codecoverage matrix still tests on PHP 7.4 through 8.4; it installs dependencies on 8.3 via the `install-php-version` input of `reusable-codecoverage.yml`, then switches to the matrix PHP for the tests. The lock file and platform config make the installed tree identical regardless of the installing PHP.

## Adding a package

PHP-Scoper does not follow package dependencies. Scope the package and every dependency of it that must be isolated.

1. Add one line per package to the `scoper-run` script in `composer.json`, following the existing ones.
2. Add a PSR-4 entry per namespace to the `autoload` section of `composer.json`, mapping the prefixed namespace to the package's source directory under `vendor-prefixed/`.
3. If the package references globals that are neither PHP built-ins nor WordPress core (e.g. WP-CLI, another plugin's classes), add them to the exclude lists in `scoper.inc.php`.
4. Run `composer run prefix-namespaces` and check the output in `vendor-prefixed/` for stray prefixed globals: `grep -rE "Bluehost\\\\Plugin\\\\[A-Za-z_]+[^\\\\]" vendor-prefixed --include="*.php" | grep -v "Bluehost.Plugin.WP"` should return nothing unexpected.
5. Reference the prefixed class names (`Bluehost\Plugin\...`) from consuming code.

## Migrating another brand plugin from Strauss (guide)

Audit result (2026-07, PRESS0-4774): `wp-plugin-bluehost` was the only repo in newfold-labs using Strauss. If another brand plugin adopts bundled-package prefixing, copy this setup rather than Strauss:

1. Copy `bin/php-scoper/composer.json` and `scoper.inc.php`. Change the `prefix` to the brand's namespace (e.g. `HostGator\Plugin`).
2. Add the `ensure-scoper`, `scoper-run`, and `prefix-namespaces` scripts to `composer.json`, hooked into `post-install-cmd` and `post-update-cmd`. Do not add a `post-autoload-dump` hook.
3. Add the PSR-4 `autoload` entries for the prefixed namespaces.
4. Gitignore `/vendor-prefixed` and `/bin/php-scoper/vendor`; exclude `scoper.inc.php` from the dist archive.
5. Ensure every workflow that runs `composer install` uses PHP 8.2+. For a codecoverage matrix that tests older PHP, pass `install-php-version` to `reusable-codecoverage.yml`. The shared translations and prep-release workflows already run on PHP 8.3.
6. If migrating from Strauss, also remove: the `extra.strauss` block, the `ensure-strauss`/`strauss-run` scripts, the `post-autoload-dump` hook, `bin/strauss.phar` (and its gitignore entry), and any `COMPOSER_HOME`/`GITHUB_TOKEN` CI workarounds. Keep the same namespace prefix and target directory so consuming modules need no changes.
7. Verify: fresh `composer install`, confirm the consuming module's prefixed classes autoload (`php -r "require 'vendor/autoload.php'; var_dump(class_exists('Brand\Plugin\...'));"`), and run the plugin's tests.
