<?php
/**
 * PHPUnit tests for Bluehost\Data (pure static methods, no WP runtime).
 *
 * get_entitlement_by_id() is pure logic; get_site_type() and runtime() use
 * get_option/is_plugin_active and are covered by wpunit DataWpunitTest.
 *
 * @package WPPluginBluehost
 */

use PHPUnit\Framework\TestCase;

class DataTest extends TestCase {

	/** @var string */
	private static $inc_path;

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		self::$inc_path = dirname( dirname( __DIR__ ) ) . '/inc';
		require_once self::$inc_path . '/Data.php';
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_no_entitlements(): void {
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( array(), 'WonderCart' ) );
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( array( 'other' => 1 ), 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_entitlements_not_array(): void {
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( array( 'entitlements' => 'not-array' ), 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_entitlement_by_name(): void {
		$solution_data = array(
			'entitlements' => array(
				array( 'name' => 'Other', 'id' => 'other-id' ),
				array( 'name' => 'WonderCart', 'id' => 'wondercart-id' ),
			),
		);
		$result = \Bluehost\Data::get_entitlement_by_id( $solution_data, 'WonderCart' );
		$this->assertIsArray( $result );
		$this->assertSame( 'WonderCart', $result['name'] );
		$this->assertSame( 'wondercart-id', $result['id'] );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_false_when_name_not_found(): void {
		$solution_data = array(
			'entitlements' => array(
				array( 'name' => 'Other', 'id' => 'other-id' ),
			),
		);
		$this->assertFalse( \Bluehost\Data::get_entitlement_by_id( $solution_data, 'WonderCart' ) );
	}

	/** @covers \Bluehost\Data::get_entitlement_by_id */
	public function test_get_entitlement_by_id_returns_first_match_when_duplicate_names(): void {
		$solution_data = array(
			'entitlements' => array(
				array( 'name' => 'Sales & Promotions', 'id' => 'first' ),
				array( 'name' => 'Sales & Promotions', 'id' => 'second' ),
			),
		);
		$result = \Bluehost\Data::get_entitlement_by_id( $solution_data, 'Sales & Promotions' );
		$this->assertSame( 'first', $result['id'] );
	}
}
