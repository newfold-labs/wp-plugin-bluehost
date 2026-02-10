<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\partners (plugin_activated and option filters).
 *
 * @covers \Bluehost\plugin_activated
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

	/** @covers \Bluehost\nfd_remove_sas_id (option filter behavior) */
	public function test_nfd_remove_sas_id_returns_false_for_blocked_sas_id(): void {
		$this->assertFalse( \Bluehost\nfd_remove_sas_id( '1258907' ) );
	}
}
