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
        
        \add_meta_box( 
            'dashboard_debug', 
            'Dashboard Debug', 
            array( __CLASS__, 'debug_widget_render' ), 
            'dashboard', 
            'side', 'high' 
        );

        \add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
        // /remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
    }

    public static function widget_render() {
        ?>
        <ul class="nfd-flex nfd-justify-between nfd-items-center nfd-gap-4">
            <li><a href="#">Profile</a></li>
            <li><a href="#">Mail</a></li>
            <li><a href="#">Hosting</a></li>
            <li><a href="#">Security</a></li>
        </ul>
        <p><strong>Quick Access</strong></p>
        <ul>
            <li><a href="#">Payment Methods</a></li>
            <li><a href="#">Renewals Center</a></li>
        </ul>
        <?php
    }

    public static function debug_widget_render() {
        global $wp_meta_boxes;
        echo '<pre>';
        print_r( $wp_meta_boxes );
        echo '</pre>';
    }

    /**
	 * Load Page Scripts & Styles.
	 *
	 * @param String $hook - The hook name
     * 
     * conditionally load assets if widget is present?
	 *
	 * @return void
	 */
	public static function assets( $hook ) {
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