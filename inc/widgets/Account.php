<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * \Bluehost\BluehostAccountWidget
 * 
 * Adds a Bluehost Account "Quick Links" dashboard widget to the WordPress dashboard.
 */
class BluehostAccountWidget {
    /**
     * The id of this widget.
     */
    const id = 'bluehost_account_widget';

	public function __construct() {
        // Register the widget
        \add_action( 'wp_dashboard_setup', array( __CLASS__, 'init' ) );
    }
    /**
     * Hook to wp_dashboard_setup to add the widget.
     */
    public static function init() {
    
        // Register the widget
        \wp_add_dashboard_widget(
            self::id,
            'Bluehost Account',
            array( __CLASS__, 'widget_render' )
        );

        \add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
    }

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
}

?>