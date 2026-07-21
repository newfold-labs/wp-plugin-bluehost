import wordpress from './wordpress.mjs';
import utils from './utils.mjs';

/**
 * Companion plugins known to call WooCommerce classes (e.g. WC_Data_Store) unconditionally
 * on bootstrap. If WooCommerce is removed while one of these is still active, it fatals on
 * the next WP-Cron tick and can take the rest of a test run down with it. Deactivated
 * alongside WooCommerce so that failure mode can't cascade regardless of upstream fixes.
 */
const WOOCOMMERCE_DEPENDENT_PLUGINS = ['wp-plugin-payments-shipping'];

/**
 * Install and activate WooCommerce plugin
 */
async function installWooCommerce() {
  try {
    await wordpress.wpCli('plugin install woocommerce --activate');
  } catch (error) {
    utils.fancyLog('Failed to install WooCommerce:' + error.message, 100, 'yellow');
  }
}

/**
 * @param {string} slug - Plugin slug
 * @returns {Promise<boolean>} true if `wp plugin is-active <slug>` exits 0
 *   (wpCli() returns 0 for empty success stdout).
 */
async function isPluginActive(slug) {
  return (await wordpress.wpCli(`plugin is-active ${slug}`)) === 0;
}

/**
 * @returns {Promise<boolean>} true if WooCommerce is active
 */
async function isWooCommerceActive() {
  return isPluginActive('woocommerce');
}

/**
 * Uninstall WooCommerce, and any companion plugin known to fatal without it active.
 * Runs `deactivate --uninstall` first; if the plugin is still active (e.g. uninstall step
 * failed), runs `plugin deactivate` so later tests do not run with WooCommerce still active.
 * Repeats up to `maxAttempts` (no unbounded recursion).
 */
async function uninstallWooCommerce() {
  const maxAttempts = 3;
  for (let i = 0; i < maxAttempts; i++) {
    if (!(await isWooCommerceActive())) {
      break;
    }
    await wordpress.wpCli('plugin deactivate woocommerce --uninstall');
    if (!(await isWooCommerceActive())) {
      break;
    }
    await wordpress.wpCli('plugin deactivate woocommerce');
  }
  if (await isWooCommerceActive()) {
    utils.fancyLog(
      'WooCommerce is still active after multiple deactivate attempts; later tests may fail.',
      100,
      'yellow',
    );
  }

  for (const slug of WOOCOMMERCE_DEPENDENT_PLUGINS) {
    if (await isPluginActive(slug)) {
      await wordpress.wpCli(`plugin deactivate ${slug}`);
    }
  }
}

export default {
  installWooCommerce,
  isWooCommerceActive,
  uninstallWooCommerce,
};
