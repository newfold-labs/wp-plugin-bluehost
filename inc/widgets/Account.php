<?php
/**
 * Hosting Account Widget.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use function NewfoldLabs\WP\ModuleLoader\container;
use function NewfoldLabs\WP\Context\getContext;

/**
 * \Bluehost\BluehostAccountWidget
 *
 * Adds a Bluehost Account "Quick Links" dashboard widget to the WordPress dashboard.
 */
class BluehostAccountWidget {
	/**
	 * The id of this widget.
	 */
	const ID = 'bluehost_account_widget';

	/**
	 * Constructor
	 */
	public function __construct() {
		// Register the widget
		\add_action( 'wp_dashboard_setup', array( __CLASS__, 'init' ), 1 );
	}
	/**
	 * Hook to wp_dashboard_setup to add the widget.
	 */
	public static function init() {

		// Register the widget
		\wp_add_dashboard_widget(
			self::ID,
			'Bluehost Account',
			array( __CLASS__, 'widget_render' ),
			null,
			null,
			'column3',
			'high'
		);

		\add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	/**
	 * Render the widget
	 */
	public static function widget_render() {
		$view_file = BLUEHOST_PLUGIN_DIR . '/inc/widgets/views/account.php';
		include $view_file;
	}

	/**
	 * Load scripts/styles needed for this dashboard widget.
	 *
	 * @return void
	 */
	public static function assets() {
		// enqueue the bluehost-style stylesheet
		// this is registered in Admin.php > assets()
		\wp_enqueue_style( 'bluehost-style' );
	}

	/**
	 * Add UTM params to a URL
	 *
	 * @param string $url the URL
	 * @return string the URL with UTM params
	 */
	public static function add_utm_params( $url ) {
		$data        = array(
			'utm_source' => 'wp-admin/index.php?widget=bluehost_account_widget',
			'utm_medium' => 'bluehost_plugin',
		);
		return $url .= '?' . http_build_query( $data );
	}

	/**
	 * Check if the user is Jarvis
	 *
	 * @return bool
	 */
	public static function is_jarvis() {
		$capabilities = container()->get( 'capabilities' )->all();
		if ( isset( $capabilities['isJarvis'] ) && $capabilities['isJarvis'] ) {
			return true;
		}
		return false;
	}

	/**
	 * Get the platform path URL
	 *
	 * @param string $jarvisPath the jarvis path
	 * @param string $legacyPath the legacy path
	 * @return string platform link
	 */
	public static function get_platform_path_url( $jarvisPath = '', $legacyPath = '' ) {
		return self::is_jarvis() ?
			self::get_platform_base_url( '/my-account/' ) . $jarvisPath :
			self::get_platform_base_url( '/hosting/' ) . $legacyPath;
	}

	/**
	 * Get the platform base URL
	 *
	 * @param string $path the path
	 * @return string platform link
	 */
	public static function get_platform_base_url( $path = '' ) {
		$brand = getContext( 'brand' );

		if ( 'Bluehost_India' === $brand ) {
			return 'https://my.bluehost.in' . $path;
		}

		if ( self::is_jarvis() ) {
			return 'https://www.bluehost.com' . $path;
		} else {
			return 'https://my.bluehost.com' . $path;
		}
	}
}
