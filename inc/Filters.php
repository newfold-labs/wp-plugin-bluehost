<?php
/**
 * Handles global filters for the plugin.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use function NewfoldLabs\WP\ModuleLoader\container;
use function NewfoldLabs\WP\Module\LinkTracker\Functions\build_link as buildLink;

/**
 * Class Filters
 *
 * Registers global WordPress filters for the plugin.
 */
final class Filters {

	/**
	 * Register all filters.
	 */
	public static function init() {
		\add_filter( 'http_request_args', array( __CLASS__, 'add_hiive_headers' ), 99, 2 );
		\add_filter( 'newfold/sso/hosting_login', array( __CLASS__, 'configure_hosting_login' ) );
	}

	/**
	 * Add locale headers to Hiive API requests.
	 *
	 * @param array  $args - HTTP request arguments.
	 * @param string $url - URL of the request.
	 *
	 * @return array
	 */
	public static function add_hiive_headers( $args, $url ) {
		$container = container();
		if ( defined( 'NFD_HIIVE_URL' ) && strpos( $url, NFD_HIIVE_URL ) !== false ) {
			if ( ! isset( $args['headers'] ) || ! is_array( $args['headers'] ) ) {
				$args['headers'] = array();
			}
			$args['headers']['X-WP-LOCALE']      = get_locale();
			$args['headers']['X-HOST-PLUGIN-ID'] = $container->plugin()->id;
		}

		return $args;
	}

	/**
	 * Recovery affordance for users sent to wp-login.php after a temp →
	 * permanent domain switch logs them out — points them at the Bluehost
	 * portal so they can SSO back in.
	 *
	 * @param array $config Default config from wp-module-sso.
	 *
	 * @return array
	 */
	public static function configure_hosting_login( $config ) {
		$config['enabled']  = true;
		$config['url']      = buildLink(
			'https://www.bluehost.com/my-account/hosting/details/sites',
			array( 'source' => 'hosting_login_button' )
		);
		$config['label']    = __( 'Login with Bluehost', 'wp-plugin-bluehost' );
		$config['accent_color'] = Brand::BUTTON_BACKGROUND;
		$config['icon_svg'] = Helpers::get_svg( 'bluehost-grid-mark' );

		return $config;
	}
}
