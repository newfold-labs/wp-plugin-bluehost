<?php
/**
 * PHPUnit tests for Bluehost\partners (pure functions, no WP runtime).
 *
 * @package WPPluginBluehost
 */

use PHPUnit\Framework\TestCase;

class PartnersTest extends TestCase {

	/** @var string */
	private static $inc_path;

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		self::$inc_path = dirname( dirname( __DIR__ ) ) . '/inc';
		if ( ! function_exists( 'add_action' ) ) {
			function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {}
		}
		if ( ! function_exists( 'add_filter' ) ) {
			function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {}
		}
		require_once self::$inc_path . '/partners.php';
	}

	/** @covers \Bluehost\wpforms_upgrade_affiliate_link */
	public function test_wpforms_upgrade_affiliate_link_returns_url_with_encoded_param(): void {
		$url = 'https://wpforms.com/lite-upgrade/';
		$out = \Bluehost\wpforms_upgrade_affiliate_link( $url );
		$this->assertStringContainsString( 'shareasale.com', $out );
		$this->assertStringContainsString( rawurlencode( $url ), $out );
	}

	/** @covers \Bluehost\aioseo_upgrade_affiliate_link */
	public function test_aioseo_upgrade_affiliate_link_returns_url_with_encoded_param(): void {
		$url = 'https://aioseo.com/upgrade/';
		$out = \Bluehost\aioseo_upgrade_affiliate_link( $url );
		$this->assertStringContainsString( 'shareasale.com', $out );
		$this->assertStringContainsString( rawurlencode( $url ), $out );
	}

	/** @covers \Bluehost\nfd_remove_sas_id */
	public function test_nfd_remove_sas_id_returns_false_for_blocked_id(): void {
		$this->assertFalse( \Bluehost\nfd_remove_sas_id( '1258907' ) );
	}

	/** @covers \Bluehost\nfd_remove_sas_id */
	public function test_nfd_remove_sas_id_returns_value_for_other_ids(): void {
		$this->assertSame( 'other_id', \Bluehost\nfd_remove_sas_id( 'other_id' ) );
		$this->assertSame( '', \Bluehost\nfd_remove_sas_id( '' ) );
	}
}
