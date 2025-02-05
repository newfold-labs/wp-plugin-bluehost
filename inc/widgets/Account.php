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
        ?>
        <div class="nfd-root" data-slot="bluehost-account-widget">
            <ul class="nfd-flex nfd-justify-between nfd-items-center nfd-gap-4">
                <li><a class="nfd-card" href="#"><?php _e( 'Profile', 'wp-plugin-bluehost' ); ?></a></li>
                <li><a class="nfd-card" href="#"><?php _e( 'Mail', 'wp-plugin-bluehost' ); ?></a></li>
                <li><a class="nfd-card" href="#"><?php _e( 'Hosting', 'wp-plugin-bluehost' ); ?></a></li>
                <li><a class="nfd-card" href="#"><?php _e( 'Security', 'wp-plugin-bluehost' ); ?></a></li>
            </ul>
            <p><strong><?php _e( 'Quick Access', 'wp-plugin-bluehost' ); ?></strong></p>
            <ul>
                <li><a href="#"><?php _e( 'Payment Methods', 'wp-plugin-bluehost' ); ?></a></li>
                <li><a href="#"><?php _e( 'Renewals Center', 'wp-plugin-bluehost' ); ?></a></li>
            </ul>
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

        \wp_register_script(
            'bluehost-script',
            BLUEHOST_BUILD_URL . '/index.js',
            array_merge( $asset['dependencies'], array( 'newfold-features', 'nfd-runtime' ) ),
            $asset['version'],
            true
        );

        \wp_set_script_translations(
            'bluehost-script',
            'wp-plugin-bluehost',
            BLUEHOST_PLUGIN_DIR . '/languages'
        );

        \wp_register_style(
            'bluehost-style',
            BLUEHOST_BUILD_URL . '/index.css',
            array( 'wp-components' ),
            $asset['version']
        );

        \wp_enqueue_style( 'bluehost-style' );
        \wp_enqueue_script( 'bluehost-script' );
	}
}

?>