<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\GoogleSiteKit.
 *
 * @coversDefaultClass \Bluehost\GoogleSiteKit
 */
class GoogleSiteKitWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		require_once codecept_root_dir( 'inc/GoogleSiteKit.php' );
	}

	/** @covers \Bluehost\GoogleSiteKit::maybe_enable_google_site_kit */
	public function test_maybe_enable_google_site_kit_returns_value_unchanged_when_not_array(): void {
		$sut   = new \Bluehost\GoogleSiteKit();
		$value = 'not-an-array';
		$this->assertSame( $value, $sut->maybe_enable_google_site_kit( $value ) );
	}

	/** @covers \Bluehost\GoogleSiteKit::maybe_enable_google_site_kit */
	public function test_maybe_enable_google_site_kit_returns_value_when_array_without_key(): void {
		$sut   = new \Bluehost\GoogleSiteKit();
		$value = array( 'other_key' => true );
		$this->assertSame( $value, $sut->maybe_enable_google_site_kit( $value ) );
	}

	/** @covers \Bluehost\GoogleSiteKit::maybe_enable_google_site_kit */
	public function test_maybe_enable_google_site_kit_returns_value_when_google_site_kit_enabled(): void {
		$sut   = new \Bluehost\GoogleSiteKit();
		$value = array( 'google_site_kit_feature_enabled' => true );
		$this->assertSame( $value, $sut->maybe_enable_google_site_kit( $value ) );
	}
}
