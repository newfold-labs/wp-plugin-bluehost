<?php
/**
 * Help Widget.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * \Bluehost\BluehostHelpWidget
 *
 * Adds a Bluehost Help "Quick Links" dashboard widget to the WordPress dashboard.
 */
class BluehostHelpWidget {
	/**
	 * The id of this widget.
	 */
	const ID = 'bluehost_help_widget';

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
			__( 'Need Some Help?', 'wp-plugin-bluehost' ),
			array( __CLASS__, 'widget_render' ),
			null,
			null,
			'side',
			'high'
		);

		\add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	/**
	 * Render the widget
	 */
	public static function widget_render() {
		$view_file = BLUEHOST_PLUGIN_DIR . '/inc/widgets/views/help.php';
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
	 * Check if the user has access to the Help Center
	 *
	 * @return bool
	 */
	public static function can_access_help_center() {
		$capabilities = container()->get( 'capabilities' )->all();
		if ( isset( $capabilities['canAccessHelpCenter'] ) && $capabilities['canAccessHelpCenter'] ) {
			return true;
		}
		return false;
	}
}
