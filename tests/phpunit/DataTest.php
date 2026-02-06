<?php
/**
 * Tests for Bluehost\Data.
 *
 * @package WPPluginBluehost
 */

/**
 * Class DataTest
 */
class DataTest extends WP_UnitTestCase {

	/**
	 * Define constants and load Data class.
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();
		if ( ! defined( 'BLUEHOST_BUILD_URL' ) ) {
			define( 'BLUEHOST_BUILD_URL', 'https://test/build/1.0.0' );
		}
		if ( ! defined( 'BLUEHOST_PLUGIN_VERSION' ) ) {
			define( 'BLUEHOST_PLUGIN_VERSION', '1.0.0' );
		}
		if ( ! defined( 'BLUEHOST_PLUGIN_URL' ) ) {
			define( 'BLUEHOST_PLUGIN_URL', 'https://test/' );
		}
		require_once dirname( dirname( __DIR__ ) ) . '/inc/Data.php';
	}

	/**
	 * get_entitlement_by_id returns false when solution_data has no entitlements key.
	 */
	public function test_get_entitlement_by_id_returns_false_when_no_entitlements() {
		$data = array( 'solution' => 'foo' );
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( $data, 'WonderCart' ) );
	}

	/**
	 * get_entitlement_by_id returns false when entitlements is not an array.
	 */
	public function test_get_entitlement_by_id_returns_false_when_entitlements_not_array() {
		$data = array( 'entitlements' => 'invalid' );
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( $data, 'WonderCart' ) );
	}

	/**
	 * get_entitlement_by_id returns matching entitlement by name.
	 */
	public function test_get_entitlement_by_id_returns_entitlement_by_name() {
		$entitlement = array( 'name' => 'WonderCart', 'id' => '123' );
		$data        = array( 'entitlements' => array( array( 'name' => 'Other' ), $entitlement ) );
		$this->assertEquals( $entitlement, \Bluehost\Data::get_entitlement_by_id( $data, 'WonderCart' ) );
	}

	/**
	 * get_entitlement_by_id returns false when name does not match.
	 */
	public function test_get_entitlement_by_id_returns_false_when_name_not_found() {
		$data = array(
			'entitlements' => array(
				array( 'name' => 'WonderCart' ),
			),
		);
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( $data, 'Sales & Promotions' ) );
	}

	/**
	 * get_site_type returns 'store' when WooCommerce is active.
	 */
	public function test_get_site_type_returns_store_when_woocommerce_active() {
		// Simulate WooCommerce active by filtering is_plugin_active in test.
		add_filter(
			'option_active_plugins',
			function ( $plugins ) {
				if ( ! is_array( $plugins ) ) {
					$plugins = array();
				}
				$plugins[] = 'woocommerce/woocommerce.php';
				return $plugins;
			}
		);
		// get_site_type uses is_plugin_active() which checks active_plugins option in unit test context.
		update_option( 'active_plugins', array( 'woocommerce/woocommerce.php' ) );
		$this->assertSame( 'store', \Bluehost\Data::get_site_type() );
	}

	/**
	 * get_site_type returns 'website' when no onboarding site type.
	 */
	public function test_get_site_type_returns_website_by_default() {
		delete_option( 'nfd_module_onboarding_site_info' );
		update_option( 'active_plugins', array() );
		$this->assertSame( 'website', \Bluehost\Data::get_site_type() );
	}

	/**
	 * get_site_type maps onboarding personal to blog.
	 */
	public function test_get_site_type_maps_personal_to_blog() {
		update_option( 'nfd_module_onboarding_site_info', array( 'site_type' => 'personal' ) );
		update_option( 'active_plugins', array() );
		$this->assertSame( 'blog', \Bluehost\Data::get_site_type() );
	}
}
