<?php

namespace Bluehost;

/**
 * Loads the Bluehost domain-search integration inside the 10Web WVC editor.
 */
class TenWebDomainSearch {

	/**
	 * Script handle.
	 *
	 * @var string
	 */
	const HANDLE = 'bluehost-tenweb-domain-search';

	/**
	 * Register early editor hooks.
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'maybe_enqueue_assets' ), 8 );
		add_action( 'load-post.php', array( $this, 'maybe_enqueue_assets' ), 8 );
	}

	/**
	 * Load the isolated editor bundle on WVC requests only.
	 */
	public function maybe_enqueue_assets() {
		if ( ! $this->is_wvc_editor_request() || ! apply_filters( 'newfold/tenweb/filter/domain_search_enabled', true ) ) {
			return;
		}

		$asset_file = BLUEHOST_BUILD_DIR . '/tenweb-domain-search.asset.php';
		if ( ! is_readable( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;
		wp_enqueue_style(
			self::HANDLE,
			BLUEHOST_BUILD_URL . '/style-tenweb-domain-search.css',
			array(),
			$asset['version']
		);
		wp_enqueue_script(
			self::HANDLE,
			BLUEHOST_BUILD_URL . '/tenweb-domain-search.js',
			$asset['dependencies'],
			$asset['version'],
			false
		);

		$config = array(
			'apiUrl'    => esc_url_raw( rest_url( 'bluehost/v1/domains/search' ) ),
			'nonce'     => wp_create_nonce( 'wp_rest' ),
			'seed'      => $this->get_search_seed(),
			'homeUrl'   => esc_url_raw( home_url() ),
			'placement' => 'auto',
			'debug'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
			'tlds'      => array( '.com', '.shop', '.store', '.online', '.net', '.org' ),
			'selectors' => array(
				'stage'         => '[data-wvc-region="stage"]',
				'stageAnchor'   => '[data-wvc-stage="onboarding"]',
				'stageReady'    => '[data-testid="site-parts-visibility"], iframe[title*="preview" i]',
				'chat'          => '.sidebar.open .chat, .left-sidebar .chat',
				'chatMessage'   => '.chat__message',
				'header'        => '.main-content-header, .header-wrapper > .header',
				'headerAnchor'  => '.mw-min-content, .site-info',
				'publishMenu'   => '.dropdown__content--hover-animated, .dropdown__content',
				'publishButton' => 'button',
			),
			'strings'   => array(
				'title'          => __( 'Choose your domain', 'wp-plugin-bluehost' ),
				'stageTitle'     => __( 'Choose your domain while we build your site', 'wp-plugin-bluehost' ),
				'description'    => __( 'Choose a suggestion or search for another domain.', 'wp-plugin-bluehost' ),
				'placeholder'    => __( 'your business name', 'wp-plugin-bluehost' ),
				'extension'      => __( 'Domain extension', 'wp-plugin-bluehost' ),
				'search'         => __( 'Search', 'wp-plugin-bluehost' ),
				'select'         => __( 'Select', 'wp-plugin-bluehost' ),
				'selected'       => __( 'Selected', 'wp-plugin-bluehost' ),
				'change'         => __( 'Change', 'wp-plugin-bluehost' ),
				'connect'        => __( 'Connect domain', 'wp-plugin-bluehost' ),
				'available'      => __( 'Available domains', 'wp-plugin-bluehost' ),
				'availableShort' => __( 'Available', 'wp-plugin-bluehost' ),
				'bestMatch'      => __( 'Best match', 'wp-plugin-bluehost' ),
				'premium'        => __( 'Premium', 'wp-plugin-bluehost' ),
				'aftermarket'    => __( 'Aftermarket', 'wp-plugin-bluehost' ),
				'empty'          => __( 'No available domains found. Try another search.', 'wp-plugin-bluehost' ),
				'error'          => __( 'Domain search is temporarily unavailable. Please try again.', 'wp-plugin-bluehost' ),
				'loading'        => __( 'Searching domains…', 'wp-plugin-bluehost' ),
				'checking'       => __( 'Checking availability…', 'wp-plugin-bluehost' ),
				/* translators: %s is the domain renewal price. */
				'renewal'        => __( 'then %s/yr', 'wp-plugin-bluehost' ),
				'disclaimer'     => __( 'Selection does not complete the purchase.', 'wp-plugin-bluehost' ),
			),
		);

		$config = apply_filters( 'newfold/tenweb/filter/domain_search_config', $config );
		wp_add_inline_script(
			self::HANDLE,
			'window.BluehostTenWebDomainSearch = ' . wp_json_encode( $config ) . ';',
			'before'
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

	/**
	 * Derive a safe initial search term from the site title.
	 *
	 * @return string
	 */
	private function get_search_seed() {
		$seed = sanitize_title( (string) get_bloginfo( 'name' ) );
		$seed = preg_replace( '/[^a-z0-9-]/', '', strtolower( $seed ) );

		return $seed ? $seed : 'yoursite';
	}
}
