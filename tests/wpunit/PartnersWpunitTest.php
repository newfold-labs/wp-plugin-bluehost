<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\partners (plugin_activated, affiliate links, option filters).
 *
 * @covers \Bluehost\plugin_activated
 * @covers \Bluehost\wpforms_upgrade_affiliate_link
 * @covers \Bluehost\aioseo_upgrade_affiliate_link
 * @covers \Bluehost\nfd_remove_sas_id
 */
class PartnersWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/partners.php' );
	}

	/** @covers \Bluehost\plugin_activated */
	public function test_plugin_activated_sets_woocommerce_allow_tracking_for_woocommerce(): void {
		delete_option( 'woocommerce_allow_tracking' );
		\Bluehost\plugin_activated( 'woocommerce/woocommerce.php' );
		$this->assertSame( 'yes', get_option( 'woocommerce_allow_tracking' ) );
	}

	/** @covers \Bluehost\plugin_activated */
	public function test_plugin_activated_does_nothing_for_other_plugins(): void {
		delete_option( 'woocommerce_allow_tracking' );
		\Bluehost\plugin_activated( 'some-other/plugin.php' );
		$this->assertFalse( get_option( 'woocommerce_allow_tracking' ) );
	}

	/** @covers \Bluehost\wpforms_upgrade_affiliate_link */
	public function test_wpforms_upgrade_affiliate_link_returns_shareasale_url_with_encoded_destination(): void {
		$url    = 'https://wpforms.com/lite-upgrade/';
		$result = \Bluehost\wpforms_upgrade_affiliate_link( $url );
		$this->assertStringContainsString( 'shareasale.com', $result );
		$this->assertStringContainsString( 'urllink=', $result );
		$this->assertStringContainsString( rawurlencode( $url ), $result );
	}

	/** @covers \Bluehost\aioseo_upgrade_affiliate_link */
	public function test_aioseo_upgrade_affiliate_link_returns_shareasale_url_with_encoded_destination(): void {
		$url    = 'https://aioseo.com/pricing/';
		$result = \Bluehost\aioseo_upgrade_affiliate_link( $url );
		$this->assertStringContainsString( 'shareasale.com', $result );
		$this->assertStringContainsString( 'urllink=', $result );
		$this->assertStringContainsString( rawurlencode( $url ), $result );
	}

	/** @covers \Bluehost\nfd_remove_sas_id */
	public function test_nfd_remove_sas_id_returns_false_for_blocked_sas_id(): void {
		$this->assertFalse( \Bluehost\nfd_remove_sas_id( '1258907' ) );
	}

	/** @covers \Bluehost\nfd_remove_sas_id */
	public function test_nfd_remove_sas_id_returns_value_unchanged_when_not_blocked(): void {
		$this->assertSame( '9999999', \Bluehost\nfd_remove_sas_id( '9999999' ) );
	}
}
