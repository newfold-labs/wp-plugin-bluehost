<?php

namespace Bluehost;

/**
 * Loads the Bluehost domain-connect MFE inside the 10Web WVC editor.
 */
class TenWebDomainConnect {

	const HANDLE_LOADER = 'bluehost-tenweb-domain-connect-loader';
	const HANDLE_MFE      = 'bluehost-domain-connect-mfe';

	/**
	 * Register early editor hooks.
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'maybe_enqueue_assets' ), 8 );
		add_action( 'load-post.php', array( $this, 'maybe_enqueue_assets' ), 8 );
		add_filter( 'script_loader_tag', array( $this, 'set_mfe_script_type_module' ), 10, 3 );
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
		wp_enqueue_style(
			self::HANDLE_MFE,
			$mfe_base . '/styles.css',
			array(),
			null
		);
		wp_enqueue_script(
			self::HANDLE_MFE,
			$mfe_base . '/main.js',
			array(),
			null,
			true
		);

		$asset = require $asset_file;
		wp_enqueue_style(
			self::HANDLE_LOADER,
			BLUEHOST_BUILD_URL . '/style-tenweb-domain-connect.css',
			array( self::HANDLE_MFE ),
			$asset['version']
		);
		wp_enqueue_script(
			self::HANDLE_LOADER,
			BLUEHOST_BUILD_URL . '/tenweb-domain-connect.js',
			array_merge( $asset['dependencies'], array( self::HANDLE_MFE ) ),
			$asset['version'],
			true
		);

		$config = array(
			'contextUrl' => esc_url_raw( rest_url( 'bluehost/v1/domain-connect/context' ) ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),
			'placement'  => 'auto',
			'debug'      => defined( 'WP_DEBUG' ) && WP_DEBUG,
			'mfeBaseUrl' => esc_url_raw( $mfe_base ),
			'selectors'  => array(
				'stage'        => '[data-wvc-region="stage"]',
				'stageAnchor'  => '[data-wvc-stage="onboarding"]',
				'stageReady'   => '[data-wvc-stage="ready"], [data-wvc-stage="plan-review"], [data-testid="site-parts-visibility"], .sp-preview, .interactive-container, iframe',
				'chat'         => '.sidebar.open .chat, .left-sidebar .chat',
				'chatMessage'  => '.chat__message',
				'header'       => '.main-content-header, .header-wrapper > .header',
				'headerAnchor' => '.mw-min-content, .site-info',
				'publishMenu'  => '.dropdown__content--hover-animated, .dropdown__content',
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
	 * @param string $tag    Script tag.
	 * @param string $handle Handle.
	 * @param string $src    Source URL.
	 * @return string
	 */
	public function set_mfe_script_type_module( $tag, $handle, $src ) {
		if ( self::HANDLE_MFE !== $handle ) {
			return $tag;
		}

		if ( false !== strpos( $tag, 'type=' ) ) {
			return $tag;
		}

		return str_replace( '<script ', '<script type="module" ', $tag );
	}

	/**
	 * @return string
	 */
	private function get_mfe_base_url() {
		$use_qa = apply_filters(
			'newfold/tenweb/filter/domain_connect_use_qa_mfe',
			( defined( 'WP_ENVIRONMENT_TYPE' ) && in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'staging', 'development' ), true ) )
			|| ( defined( 'NFD_DOMAIN_CONNECT_QA_MFE' ) && NFD_DOMAIN_CONNECT_QA_MFE )
		);

		if ( $use_qa ) {
			return 'https://sfbff-bh.jarvisqa1k8s01.preprodapps.registeredsite.com/bh-ai-builder-mfe/domain-connect';
		}

		return 'https://sfbff.bluehost.com/bh-ai-builder-mfe/domain-connect';
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
