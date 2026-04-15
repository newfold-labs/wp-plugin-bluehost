<?php
/**
 * Lighthouse Report dashboard widget (Insights module UI).
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * Registers a dashboard widget that mirrors the Lighthouse Report section from Site Insights.
 */
class BluehostLighthouseReportWidget {

	const ID = 'bluehost_lighthouse_report_widget';

	/**
	 * Constructor.
	 */
	public function __construct() {
		\add_action( 'wp_dashboard_setup', array( __CLASS__, 'init' ), 1 );
	}

	/**
	 * Register widget when Insights is available.
	 */
	public static function init() {
		if ( ! \current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! \class_exists( '\NewfoldLabs\WP\Module\Insights\Repositories\InsightsRepository' ) ) {
			return;
		}

		\wp_add_dashboard_widget(
			self::ID,
			\__( 'Lighthouse Report', 'wp-plugin-bluehost' ),
			array( __CLASS__, 'widget_render' ),
			null,
			null,
			'normal',
			'high'
		);

		\add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	/**
	 * Render widget markup (React mount point).
	 */
	public static function widget_render() {
		$view_file = BLUEHOST_PLUGIN_DIR . '/inc/widgets/views/lighthouse-report.php';
		if ( \is_readable( $view_file ) ) {
			include $view_file;
		}
	}

	/**
	 * Scripts and styles for the Lighthouse widget bundle.
	 *
	 * @param string $hook_suffix Current admin page.
	 */
	public static function assets( $hook_suffix ) {
		if ( 'index.php' !== $hook_suffix ) {
			return;
		}

		if ( ! \current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! \class_exists( '\NewfoldLabs\WP\Module\Insights\Repositories\InsightsRepository' ) ) {
			return;
		}

		$asset_file = BLUEHOST_BUILD_DIR . '/lighthouse-dashboard-widget.asset.php';
		if ( ! \is_readable( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		\wp_register_script(
			'bluehost-lighthouse-dashboard-widget',
			BLUEHOST_BUILD_URL . '/lighthouse-dashboard-widget.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		include_once BLUEHOST_PLUGIN_DIR . '/inc/Data.php';
		\wp_localize_script(
			'bluehost-lighthouse-dashboard-widget',
			'NFD_INSIGHTS_HOME',
			Data::insights_home_script_data()
		);

		\wp_set_script_translations(
			'bluehost-lighthouse-dashboard-widget',
			'wp-plugin-bluehost',
			BLUEHOST_PLUGIN_DIR . '/languages'
		);

		\wp_enqueue_script( 'bluehost-lighthouse-dashboard-widget' );

		\wp_register_style(
			'bluehost-lighthouse-dashboard-widget',
			BLUEHOST_BUILD_URL . '/lighthouse-dashboard-widget.css',
			array(),
			$asset['version']
		);
		\wp_enqueue_style( 'bluehost-lighthouse-dashboard-widget' );
	}
}
