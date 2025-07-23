<?php
/**
 * Plugin bootstrap file
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use WP_Forge\WPUpdateHandler\PluginUpdater;
use WP_Forge\UpgradeHandler\UpgradeHandler;
use NewfoldLabs\WP\ModuleLoader\Container;
use NewfoldLabs\WP\ModuleLoader\Plugin;
use NewfoldLabs\WP\Module\Features\Features;
use function NewfoldLabs\WP\ModuleLoader\container as setContainer;
use function NewfoldLabs\WP\Context\setContext;
use function NewfoldLabs\WP\Context\getContext;
use function NewfoldLabs\WP\Module\LinkTracker\Functions\build_link as buildLink;

// Composer autoloader
if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	if ( 'local' === wp_get_environment_type() ) {
		wp_die( esc_html( __( 'Please install the Bluehost Plugin dependencies.', 'wp-plugin-bluehost' ) ) );
	}

	return;
}

require_once __DIR__ . '/inc/GoogleSiteKit.php';

/*
 * Initialize module settings via container
 */
$nfd_module_container = new Container();

// Context setup
add_action(
	'newfold/context/set',
	function () {
		// set brand
		setContext( 'brand.name', 'bluehost' );
	}
);

// Set plugin to container
$nfd_module_container->set(
	'plugin',
	$nfd_module_container->service(
		function () {
			return new Plugin(
				array(
					'id'           => 'bluehost',
					'file'         => BLUEHOST_PLUGIN_FILE,
					'brand'        => get_option( 'mm_brand', 'bluehost' ),
					'install_date' => get_option( 'bluehost_plugin_install_date' ),
				)
			);
		}
	)
);

// Assign container values based on context
add_action(
	'plugins_loaded',
	function () {
		global $nfd_module_container;

		// Performance default settings
		$cache_types = array( 'browser', 'skip404' );
		// Marketplace default settings
		$marketplace_brand = 'bluehost';

		// Platform overrides
		if ( 'atomic' === getContext( 'platform' ) ) {
			$cache_types       = array();
			$marketplace_brand = 'bluehost-cloud';
		}

		if ( $nfd_module_container ) {
			$nfd_module_container->set( 'cache_types', $cache_types );
			$nfd_module_container->set( 'marketplace_brand', $marketplace_brand );
		}
	}
);
add_filter(
	'newfold/coming-soon/filter/args',
	function ( $args, $default_args ) {
		$logo_svg = file_get_contents( BLUEHOST_PLUGIN_DIR . '/assets/svg/bluehost-logo.svg' );

		$backlinks = array(
			sprintf(
			/* translators: %1$s starts the bold text, %2$s ends the bold text and adds a line break, %3$s is the link to the Domain Registration page, %4$s is the closing link for Domain Registration, %5$s wraps everything inside a span with text-center class */
				esc_html__( '%1$sNeed a domain?%2$sCheck out our %3$sDomain Registration%4$s options.%5$s', 'wp-plugin-bluehost' ),
				'<span class=\"text-center\"><b>',
				'</b><br>',
				'<a href=\"' . esc_url( buildLink( 'https://bluehost.com/domains' ) ) . '\">',
				'</a>',
				'</span>',
			),
			sprintf(
				/* translators: %1$s starts the bold text, %2$s ends the bold text and adds a line break, %3$s is the link to Shared Hosting, %4$s is the closing link for Shared Hosting, %5$s is the link to WordPress Hosting, %6$s is the closing link for WordPress Hosting, %7$s is the link to VPS Hosting, %8$s is the closing link for VPS Hosting, %9$s is the link to Dedicated Hosting, %10$s is the closing link for Dedicated Hosting, %11$s wraps everything inside a span with text-center class */
				esc_html__(
					'%1$sDiscover our hosting solutions:%2$s
						      %3$sShared Hosting%4$s,  
						      %5$sWordPress Hosting%6$s,  
						      %7$sVPS Hosting%8$s, and  
						      %9$sDedicated Hosting%10$s. 
					      %11$s',
					'wp-plugin-bluehost'
				),
				'<span class=\"text-center\"><b>',
				'</b><br>',
				'<a href=\"' . esc_url( buildLink( 'https://bluehost.com/shared-hosting' ) ) . '\">',
				'</a>',
				'<a href=\"' . esc_url( buildLink( 'https://bluehost.com/wordpress-hosting' ) ) . '\">',
				'</a>',
				'<a href=\"' . esc_url( buildLink( 'https://bluehost.com/vps-hosting' ) ) . '\">',
				'</a>',
				'<a href=\"' . esc_url( buildLink( 'https://bluehost.com/dedicated-hosting' ) ) . '\">',
				'</a>',
				'</span>'
			),
		);

		$args = wp_parse_args(
			array(
				'admin_app_url'                  => buildLink( admin_url( 'admin.php?page=bluehost#/home' ) ),
				'template_coming_soon_backlinks' => sprintf(
					/* translators: %1$s is the logo SVG, %2$s wraps the text, %3$s is the link start for Bluehost WordPress Hosting, %4$s is the closing anchor tag, %5$s wraps the text again, %6$s contains backlinks */
					esc_html__(
						'%1$s
					%2$sA %3$sReliable WordPress Hosting by Bluehost%4$s powered website.%5$s
                    %6$s',
						'wp-plugin-bluehost'
					),
					wp_kses( $logo_svg, KSES_ALLOWED_SVG_TAGS ),
					'<span class=\"text-center\">',
					'<a target=\"_blank\" href=\"' . esc_url( buildLink( 'https://bluehost.com/wordpress' ) ) . '\" class=\"bluehost\">',
					'</a>',
					'</span>',
					$backlinks[ time() % 2 === 0 ]
				),
				'template_page_title'            => sprintf(
				/* translators: %s: Blog name */
					__( '%s &mdash; Coming Soon', 'wp-plugin-bluehost' ),
					esc_html( get_option( 'blogname' ) )
				),
				'admin_bar_text'                 => '<div style="background-color: #FEC101; color: #000; padding: 0 1rem;">' . __( 'Coming Soon Active', 'wp-plugin-bluehost' ) . '</div>',
				'admin_notice_text'              => sprintf(
				/* translators: %1$s is replaced with the opening link tag to preview the page, and %2$s is replaced with the closing link tag, %3$s is the opening link tag, %4$s is the closing link tag. */
					__( 'Your site is currently displaying a %1$scoming soon page%2$s. Once you are ready, %3$slaunch your site%4$s.', 'wp-plugin-bluehost' ),
					'<a href="' . esc_url( buildLink( get_home_url() . '?preview=coming_soon' ) ) . '" title="' . __( 'Preview the coming soon landing page', 'wp-plugin-bluehost' ) . '">',
					'</a>',
					'<a href="' . esc_url( buildLink( admin_url( 'admin.php?page=bluehost&nfd-target=coming-soon-section#/settings' ) ) ) . '">',
					'</a>'
				),
				'template_styles'                => esc_url( BLUEHOST_PLUGIN_URL . 'assets/styles/coming-soon.css' ),
			),
			$default_args
		);

		return $args;
	},
	10,
	2
);

setContainer( $nfd_module_container );

// Set up the updater endpoint and map values
$updateurl     = 'https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-bluehost?slug=bluehost-wordpress-plugin&file=bluehost-wordpress-plugin.php'; // Custom API GET endpoint
$pluginUpdater = new PluginUpdater( BLUEHOST_PLUGIN_FILE, $updateurl );
$pluginUpdater->setDataMap(
	array(
		'version'       => 'version.latest',
		'download_link' => 'download',
		'last_updated'  => 'updated',
		'requires'      => 'requires.wp',
		'requires_php'  => 'requires.php',
		'tested'        => 'tested.wp',
	)
);
$pluginUpdater->setDataOverrides(
	array(
		'banners' => array(
			'2x' => 'https://cdn.hiive.space/marketplace/vendors-assets/bluehost-banner.svg',
			'1x' => 'https://cdn.hiive.space/marketplace/vendors-assets/bluehost-banner.svg',
		),
		'icons'   => array(
			'2x' => 'https://cdn.hiive.space/marketplace/vendors-assets/bluehost-icon.svg',
			'1x' => 'https://cdn.hiive.space/marketplace/vendors-assets/bluehost-icon.svg',
		),
	)
);

// Handle any upgrade routines (only in the admin)
if ( is_admin() ) {

	// Handle plugin upgrades
	$upgrade_handler = new UpgradeHandler(
		BLUEHOST_PLUGIN_DIR . '/inc/upgrades',                    // Directory where upgrade routines live
		get_option( 'bluehost_plugin_version', '0.1.0' ), // Old plugin version (from database)
		BLUEHOST_PLUGIN_VERSION                                  // New plugin version (from code)
	);

	// Returns true if the old version doesn't match the new version
	$did_upgrade = $upgrade_handler->maybe_upgrade();

	if ( $did_upgrade ) {
		// If an upgrade occurred, update the new version in the database to prevent running the routine(s) again.
		update_option( 'bluehost_plugin_version', BLUEHOST_PLUGIN_VERSION, true );
	}
}

// Required files
require BLUEHOST_PLUGIN_DIR . '/inc/Admin.php';
require BLUEHOST_PLUGIN_DIR . '/inc/base.php';
require BLUEHOST_PLUGIN_DIR . '/inc/jetpack.php';
require BLUEHOST_PLUGIN_DIR . '/inc/LoginRedirect.php';
require BLUEHOST_PLUGIN_DIR . '/inc/partners.php';
require BLUEHOST_PLUGIN_DIR . '/inc/RestApi/SettingsController.php';
require BLUEHOST_PLUGIN_DIR . '/inc/RestApi/rest-api.php';
require BLUEHOST_PLUGIN_DIR . '/inc/settings.php';
require BLUEHOST_PLUGIN_DIR . '/inc/updates.php';
require BLUEHOST_PLUGIN_DIR . '/inc/YoastAI.php';
require BLUEHOST_PLUGIN_DIR . '/inc/widgets/bootstrap.php';
require_once BLUEHOST_PLUGIN_DIR . '/inc/Filters.php';

Filters::init();

/* WordPress Admin Page & Features */
if ( is_admin() ) {
	new Admin();
}

// Instantiate the Features singleton
Features::getInstance();

/**
 * Handle activation tasks.
 * TODO: Move this to the activation module
 *
 * @return void
 */
function on_activate() {
	// clear transients
	delete_transient( 'newfold_marketplace' );
	delete_transient( 'newfold_notifications' );
	delete_transient( 'newfold_solutions' );
	delete_transient( 'nfd_site_capabilities' );
	// Flush rewrite rules
	flush_rewrite_rules();
}

/**
 * Determine if the plugin was freshly activated.
 *
 * @return void
 */
function load_plugin() {
	if ( is_admin() && BLUEHOST_PLUGIN_FILE === get_option( 'nfd_activated_fresh' ) ) {
		delete_option( 'nfd_activated_fresh' );
		on_activate();
	}
}

// Check for plugin activation
add_action( 'admin_init', __NAMESPACE__ . '\\load_plugin' );

// Register activation hook to set the activation flag
register_activation_hook(
	BLUEHOST_PLUGIN_FILE,
	function () {
		add_option( 'nfd_activated_fresh', BLUEHOST_PLUGIN_FILE );
	}
);
