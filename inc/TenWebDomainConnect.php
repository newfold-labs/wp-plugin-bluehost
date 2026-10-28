<?php

namespace Bluehost;

/**
 * Loads the Bluehost domain-connect MFE inside the 10Web WVC editor.
 */
class TenWebDomainConnect {

	const HANDLE_LOADER     = 'bluehost-tenweb-domain-connect-loader';
	const MFE_SCRIPT_DOM_ID = 'bluehost-domain-connect-mfe-js';

	/**
	 * Register early editor hooks.
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'maybe_enqueue_assets' ), 8 );
		add_action( 'load-post.php', array( $this, 'maybe_enqueue_assets' ), 8 );
	}

	/**
	 * Load the MFE and host adapter on WVC requests only.
	 */
	public function maybe_enqueue_assets() {
		if ( ! $this->is_wvc_editor_request() || ! apply_filters( 'newfold/tenweb/filter/domain_connect_enabled', true ) ) {
			return;
		}

		$asset_file = BLUEHOST_BUILD_DIR . '/tenweb-domain-connect.asset.php';
		if ( ! is_readable( $asset_file ) ) {
			return;
		}

		$mfe_base = $this->get_mfe_base_url();
		$asset    = require $asset_file;
		wp_enqueue_style(
			self::HANDLE_LOADER,
			BLUEHOST_BUILD_URL . '/style-tenweb-domain-connect.css',
			array(),
			$asset['version']
		);
		wp_enqueue_script(
			self::HANDLE_LOADER,
			BLUEHOST_BUILD_URL . '/tenweb-domain-connect.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$config = array(
			'contextUrl'   => esc_url_raw( rest_url( 'bluehost/v1/domain-connect/context' ) ),
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'mfeScriptId'  => self::MFE_SCRIPT_DOM_ID,
			'mfeScriptUrl' => esc_url_raw( $mfe_base . '/main.js' ),
			'mfeStyleUrl'  => esc_url_raw( $mfe_base . '/styles.css' ),
			'debug'        => defined( 'WP_DEBUG' ) && WP_DEBUG,
			'labels'       => array(
				'connect'     => __( 'Connect domain', 'wp-plugin-bluehost' ),
				'preparing'   => __( 'Preparing domain selection…', 'wp-plugin-bluehost' ),
				'error'       => __( 'Domain selection could not be opened. Reload the editor to try again.', 'wp-plugin-bluehost' ),
				'unavailable' => __( 'Domain selection is unavailable. Reload the editor to try again.', 'wp-plugin-bluehost' ),
				/* translators: %s: purchased domain name. */
				'purchased'   => __( 'Domain purchased: %s', 'wp-plugin-bluehost' ),
			),
			'selectors'    => array(
				'header'       => '.main-content-header, .header-wrapper > .header',
				'headerAnchor' => '.mw-min-content, .site-info',
			),
		);

		$config = apply_filters( 'newfold/tenweb/filter/domain_connect_config', $config );
		wp_add_inline_script(
			self::HANDLE_LOADER,
			'window.BluehostTenWebDomainConnect = ' . wp_json_encode( $config ) . ';',
			'before'
		);
	}

	/**
	 * CDN base URL for the domain-connect MFE bundle.
	 *
	 * @return string
	 */
	private function get_mfe_base_url() {
		if ( self::use_qa_environment() ) {
			return 'https://sfbff-bh.jarvisqa1k8s01.preprodapps.registeredsite.com/bh-ai-builder-mfe/domain-connect';
		}

		return 'https://sfbff.bluehost.com/bh-ai-builder-mfe/domain-connect';
	}

	/**
	 * Keep the eligibility API in the same environment as the checkout MFE.
	 *
	 * @return bool
	 */
	public static function use_qa_environment() {
		return (bool) apply_filters(
			'newfold/tenweb/filter/domain_connect_use_qa_mfe',
			( defined( 'WP_ENVIRONMENT_TYPE' ) && in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'staging', 'development' ), true ) )
			|| ( defined( 'NFD_DOMAIN_CONNECT_QA_MFE' ) && NFD_DOMAIN_CONNECT_QA_MFE )
		);
	}

	/**
	 * Whether the current request is the WVC editor.
	 *
	 * @return bool
	 */
	public function is_wvc_editor_request() {
		if ( ! is_admin() ) {
			return false;
		}

		global $pagenow;
		if ( 'admin.php' === $pagenow ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Screen detection only.
			return isset( $_GET['page'] ) && 'wvc-editor' === sanitize_text_field( wp_unslash( $_GET['page'] ) );
		}
		if ( 'post.php' === $pagenow ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Screen detection only.
			return isset( $_GET['action'] ) && 'wvc-editor' === sanitize_text_field( wp_unslash( $_GET['action'] ) );
		}

		return false;
	}
}
