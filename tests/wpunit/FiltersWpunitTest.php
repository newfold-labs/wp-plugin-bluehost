<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Filters (Hiive headers, etc.).
 *
 * @coversDefaultClass \Bluehost\Filters
 */
class FiltersWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Helpers.php' );
		require_once codecept_root_dir( 'inc/Brand.php' );
		require_once codecept_root_dir( 'inc/Filters.php' );
	}

	protected function tearDown(): void {
		// Filters::init() in test_filter_is_registered_on_init registers global
		// hooks; clear them so later tests don't see lingering state.
		remove_all_filters( 'http_request_args' );
		remove_all_filters( 'newfold/sso/hosting_login' );
		parent::tearDown();
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_url_not_hiive(): void {
		$args = array(
			'method'  => 'GET',
			'headers' => array( 'Accept' => 'application/json' ),
		);
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://example.com/api' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_headers_missing(): void {
		$args = array( 'method' => 'GET' );
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://other.org/feed' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\Filters::configure_hosting_login */
	public function test_configure_hosting_login_enables_button(): void {
		$config = \Bluehost\Filters::configure_hosting_login( array() );
		$this->assertTrue( $config['enabled'] );
	}

	/** @covers \Bluehost\Filters::configure_hosting_login */
	public function test_configure_hosting_login_label_and_color(): void {
		$config = \Bluehost\Filters::configure_hosting_login( array() );
		$this->assertSame( 'Login with Bluehost', $config['label'] );
		$this->assertSame( \Bluehost\Brand::BUTTON_BACKGROUND, $config['accent_color'] );
	}

	/** @covers \Bluehost\Filters::configure_hosting_login */
	public function test_configure_hosting_login_url_targets_bluehost_portal(): void {
		$config = \Bluehost\Filters::configure_hosting_login( array() );
		$this->assertStringContainsString(
			'bluehost.com/my-account/hosting/details/sites',
			$config['url']
		);
	}

	/** @covers \Bluehost\Filters::configure_hosting_login */
	public function test_configure_hosting_login_icon_uses_currentcolor(): void {
		$config = \Bluehost\Filters::configure_hosting_login( array() );
		$this->assertNotEmpty( $config['icon_svg'] );
		$this->assertStringContainsString( 'fill="currentColor"', $config['icon_svg'] );
		$this->assertStringContainsString( '<svg', $config['icon_svg'] );
	}

	/** @covers \Bluehost\Filters::configure_hosting_login */
	public function test_configure_hosting_login_preserves_unrelated_keys(): void {
		$config = \Bluehost\Filters::configure_hosting_login( array( 'custom' => 'value' ) );
		$this->assertSame( 'value', $config['custom'] );
	}

	/**
	 * Filters::init() registers configure_hosting_login on the SSO filter — once
	 * wired up, applying the filter should yield the populated config.
	 */
	public function test_filter_is_registered_on_init(): void {
		\Bluehost\Filters::init();
		$config = apply_filters(
			\NewfoldLabs\WP\Module\SSO\SSO_Hosting_Login::FILTER,
			array()
		);
		$this->assertTrue( ! empty( $config['enabled'] ) );
		$this->assertSame( 'Login with Bluehost', $config['label'] );
	}
}
