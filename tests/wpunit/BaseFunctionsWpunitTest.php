<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost base helper functions (install date, setup, KSES).
 *
 * @covers \Bluehost\bluehost_has_plugin_install_date
 * @covers \Bluehost\bluehost_get_plugin_install_date
 * @covers \Bluehost\bluehost_set_plugin_install_date
 * @covers \Bluehost\bluehost_get_days_since_plugin_install_date
 * @covers \Bluehost\bluehost_install_date_filter
 * @covers \Bluehost\bluehost_setup
 */
class BaseFunctionsWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/base.php' );
	}

	protected function tearDown(): void {
		delete_option( 'bluehost_plugin_install_date' );
		delete_option( 'mm_install_date' );
		delete_option( 'mm_cron' );
		delete_option( 'mm_master_aff' );
		parent::tearDown();
	}

	public function test_bluehost_has_plugin_install_date_returns_false_when_empty(): void {
		delete_option( 'bluehost_plugin_install_date' );
		$this->assertFalse( \Bluehost\bluehost_has_plugin_install_date() );
	}

	public function test_bluehost_has_plugin_install_date_returns_true_when_set(): void {
		update_option( 'bluehost_plugin_install_date', '1234567890', true );
		$this->assertTrue( \Bluehost\bluehost_has_plugin_install_date() );
	}

	public function test_bluehost_set_and_get_plugin_install_date_roundtrip(): void {
		$value = '9876543210';
		\Bluehost\bluehost_set_plugin_install_date( $value );
		$this->assertSame( $value, \Bluehost\bluehost_get_plugin_install_date() );
	}

	public function test_bluehost_get_plugin_install_date_returns_string(): void {
		delete_option( 'bluehost_plugin_install_date' );
		$result = \Bluehost\bluehost_get_plugin_install_date();
		$this->assertIsString( $result );
		$this->assertMatchesRegularExpression( '/^\d+$/', $result );
	}

	public function test_bluehost_get_days_since_plugin_install_date(): void {
		$five_days_ago = (string) ( time() - 5 * DAY_IN_SECONDS );
		\Bluehost\bluehost_set_plugin_install_date( $five_days_ago );
		$days = \Bluehost\bluehost_get_days_since_plugin_install_date();
		$this->assertIsInt( $days );
		$this->assertGreaterThanOrEqual( 4, $days );
		$this->assertLessThanOrEqual( 6, $days );
	}

	public function test_bluehost_install_date_filter_returns_install_date(): void {
		$value = '1111111111';
		\Bluehost\bluehost_set_plugin_install_date( $value );
		$this->assertSame( $value, \Bluehost\bluehost_install_date_filter() );
	}

	public function test_kses_allowed_svg_tags_constant_defined(): void {
		$this->assertTrue( defined( 'Bluehost\KSES_ALLOWED_SVG_TAGS' ) );
		$tags = \Bluehost\KSES_ALLOWED_SVG_TAGS;
		$this->assertIsArray( $tags );
		$this->assertArrayHasKey( 'svg', $tags );
		$this->assertArrayHasKey( 'path', $tags );
		$this->assertArrayHasKey( 'rect', $tags );
		$this->assertArrayHasKey( 'text', $tags );
		$this->assertArrayHasKey( 'g', $tags );
	}

	public function test_bluehost_setup_sets_plugin_install_date_when_missing(): void {
		delete_option( 'bluehost_plugin_install_date' );
		update_option( 'mm_install_date', 'Jan 15, 2020' );
		\Bluehost\bluehost_setup();
		$this->assertTrue( \Bluehost\bluehost_has_plugin_install_date() );
		$date = \DateTime::createFromFormat( 'M d, Y', 'Jan 15, 2020' );
		$this->assertSame( (string) $date->format( 'U' ), \Bluehost\bluehost_get_plugin_install_date() );
	}
}
