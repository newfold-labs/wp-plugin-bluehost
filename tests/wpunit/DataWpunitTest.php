<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Data (runtime data, entitlements, site type).
 *
 * @coversDefaultClass \Bluehost\Data
 */
class DataWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Data.php' );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_no_entitlements(): void {
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( array( 'solution' => 'foo' ), 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_entitlements_not_array(): void {
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( array( 'entitlements' => 'invalid' ), 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_entitlement_by_name(): void {
		$entitlement = array( 'name' => 'WonderCart', 'id' => '123' );
		$data        = array( 'entitlements' => array( array( 'name' => 'Other' ), $entitlement ) );
		$this->assertEquals( $entitlement, \Bluehost\Data::get_entitlement_by_id( $data, 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_name_not_found(): void {
		$data = array( 'entitlements' => array( array( 'name' => 'WonderCart' ) ) );
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( $data, 'Sales & Promotions' ) );
	}

	/** @covers \Bluehost\Data::get_site_type */
	public function test_get_site_type_returns_website_by_default(): void {
		update_option( 'active_plugins', array() );
		delete_option( 'nfd_module_onboarding_site_info' );
		$this->assertSame( 'website', \Bluehost\Data::get_site_type() );
	}

	/** @covers \Bluehost\Data::get_site_type */
	public function test_get_site_type_maps_personal_to_blog(): void {
		update_option( 'active_plugins', array() );
		update_option( 'nfd_module_onboarding_site_info', array( 'site_type' => 'personal' ) );
		$this->assertSame( 'blog', \Bluehost\Data::get_site_type() );
	}

	/** @covers \Bluehost\Data::get_site_type */
	public function test_get_site_type_maps_business_to_website(): void {
		update_option( 'active_plugins', array() );
		update_option( 'nfd_module_onboarding_site_info', array( 'site_type' => 'business' ) );
		$this->assertSame( 'website', \Bluehost\Data::get_site_type() );
	}

	/** @covers \Bluehost\Data::get_site_type */
	public function test_get_site_type_maps_ecommerce_to_store(): void {
		update_option( 'active_plugins', array() );
		update_option( 'nfd_module_onboarding_site_info', array( 'site_type' => 'ecommerce' ) );
		$this->assertSame( 'store', \Bluehost\Data::get_site_type() );
	}

	/** @covers \Bluehost\Data::get_site_type */
	public function test_get_site_type_returns_store_when_woocommerce_active(): void {
		update_option( 'active_plugins', array( 'woocommerce/woocommerce.php' ) );
		$this->assertSame( 'store', \Bluehost\Data::get_site_type() );
	}

	/** @covers \Bluehost\Data::is_sales_promotions_plugin_active */
	public function test_is_sales_promotions_plugin_active_returns_false_when_inactive(): void {
		update_option( 'active_plugins', array() );
		$this->assertFalse( \Bluehost\Data::is_sales_promotions_plugin_active() );
	}

	/** @covers \Bluehost\Data::is_sales_promotions_plugin_active */
	public function test_is_sales_promotions_plugin_active_returns_true_when_active(): void {
		update_option( 'active_plugins', array( 'wp-plugin-sales-promotions/wp-plugin-sales-promotions.php' ) );
		$this->assertTrue( \Bluehost\Data::is_sales_promotions_plugin_active() );
	}
}
