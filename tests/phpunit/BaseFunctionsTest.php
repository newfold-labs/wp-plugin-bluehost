<?php
/**
 * Tests for Bluehost base helper functions (install date, etc.).
 *
 * @package WPPluginBluehost
 */

/**
 * Class BaseFunctionsTest
 */
class BaseFunctionsTest extends WP_UnitTestCase {

	/**
	 * Load base.php (defines constants and functions).
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();
		if ( ! defined( 'BLUEHOST_PLUGIN_DIR' ) ) {
			define( 'BLUEHOST_PLUGIN_DIR', dirname( dirname( __DIR__ ) ) . '/' );
		}
		if ( ! defined( 'BLUEHOST_PLUGIN_FILE' ) ) {
			define( 'BLUEHOST_PLUGIN_FILE', dirname( dirname( __DIR__ ) ) . '/bluehost-wordpress-plugin.php' );
		}
		require_once dirname( dirname( __DIR__ ) ) . '/inc/base.php';
	}

	/**
	 * bluehost_has_plugin_install_date returns false when option is empty.
	 */
	public function test_bluehost_has_plugin_install_date_returns_false_when_empty() {
		delete_option( 'bluehost_plugin_install_date' );
		$this->assertFalse( \Bluehost\bluehost_has_plugin_install_date() );
	}

	/**
	 * bluehost_has_plugin_install_date returns true when option is set.
	 */
	public function test_bluehost_has_plugin_install_date_returns_true_when_set() {
		update_option( 'bluehost_plugin_install_date', '1234567890', true );
		$this->assertTrue( \Bluehost\bluehost_has_plugin_install_date() );
		delete_option( 'bluehost_plugin_install_date' );
	}

	/**
	 * bluehost_set and get_plugin_install_date round-trip.
	 */
	public function test_bluehost_set_and_get_plugin_install_date() {
		$value = '9876543210';
		\Bluehost\bluehost_set_plugin_install_date( $value );
		$this->assertSame( $value, \Bluehost\bluehost_get_plugin_install_date() );
		delete_option( 'bluehost_plugin_install_date' );
	}

	/**
	 * bluehost_get_plugin_install_date returns current timestamp when option not set.
	 */
	public function test_bluehost_get_plugin_install_date_returns_string() {
		delete_option( 'bluehost_plugin_install_date' );
		$result = \Bluehost\bluehost_get_plugin_install_date();
		$this->assertIsString( $result );
		$this->assertMatchesRegularExpression( '/^\d+$/', $result );
	}

	/**
	 * bluehost_get_days_since_plugin_install_date returns non-negative integer.
	 */
	public function test_bluehost_get_days_since_plugin_install_date() {
		\Bluehost\bluehost_set_plugin_install_date( (string) ( time() - 5 * DAY_IN_SECONDS ) );
		$days = \Bluehost\bluehost_get_days_since_plugin_install_date();
		$this->assertIsInt( $days );
		$this->assertGreaterThanOrEqual( 0, $days );
		$this->assertGreaterThanOrEqual( 4, $days );
		$this->assertLessThanOrEqual( 6, $days );
		delete_option( 'bluehost_plugin_install_date' );
	}
}
