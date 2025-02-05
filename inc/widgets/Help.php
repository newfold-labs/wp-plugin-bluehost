<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * \Bluehost\BluehostHelpWidget
 * 
 * Adds a Bluehost Help "Quick Links" dashboard widget to the WordPress dashboard.
 */
class BluehostHelpWidget {
    /**
     * The id of this widget.
     */
    const id = 'bluehost_help_widget';

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
            'Need Some Help?',
            array( __CLASS__, 'widget_render' )
        );

        \add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
        // /remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
    }

    public static function widget_render() {
        ?>
        <div class="nfd-root nfd-align-center" data-slot="bluehost-help-widget">
            <p><?php _e( 'From DIY to full-service help.', 'wp-plugin-bluehost' ); ?></p>
            <p><?php _e( 'Call or chat 24/7 for support or let our experts build your site for you.', 'wp-plugin-bluehost' ); ?></p>
        </div>
        <?php
    }

    /**
	 * Load scripts/styles needed for this dashboard widget.
	 *
	 * @return void
	 */
	public static function assets() {
        $asset_file = BLUEHOST_BUILD_DIR . '/index.asset.php';

        if ( is_readable( $asset_file ) ) {
            $asset = include_once $asset_file;
        } else {
            return;
        }

        \wp_register_style(
            'bluehost-style',
            BLUEHOST_BUILD_URL . '/index.css',
            array( 'wp-components' ),
            $asset['version']
        );

        \wp_enqueue_style( 'bluehost-style' );
	}
}

?>