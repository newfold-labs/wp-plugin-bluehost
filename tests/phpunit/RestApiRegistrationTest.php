<?php
/**
 * Tests for Bluehost REST API route registration.
 *
 * @package WPPluginBluehost
 */

/**
 * Class RestApiRegistrationTest
 */
class RestApiRegistrationTest extends WP_UnitTestCase {

	/**
	 * Load REST API and trigger registration.
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();
		if ( ! defined( 'BLUEHOST_PLUGIN_DIR' ) ) {
			define( 'BLUEHOST_PLUGIN_DIR', dirname( dirname( __DIR__ ) ) . '/' );
		}
		require_once dirname( dirname( __DIR__ ) ) . '/inc/RestApi/SettingsController.php';
		require_once dirname( dirname( __DIR__ ) ) . '/inc/RestApi/rest-api.php';
	}

	/**
	 * Bluehost settings route is registered after rest_api_init.
	 */
	public function test_bluehost_v1_settings_route_registered() {
		do_action( 'rest_api_init' );
		$server = rest_get_server();
		$routes = $server->get_routes();
		$this->assertArrayHasKey( '/bluehost/v1/settings', $routes );
	}

	/**
	 * Settings route supports GET and POST/PUT.
	 */
	public function test_settings_route_has_get_and_edit_methods() {
		do_action( 'rest_api_init' );
		$server = rest_get_server();
		$route  = $server->get_routes()['/bluehost/v1/settings'] ?? null;
		$this->assertNotNull( $route );
		$this->assertArrayHasKey( 'GET', $route[0]['methods'] ?? array() );
		$this->assertTrue(
			isset( $route[0]['methods']['POST'] ) || isset( $route[0]['methods']['PUT'] ) || isset( $route[0]['methods']['PATCH'] ),
			'Settings route should support GET and an editable method (POST/PUT/PATCH).'
		);
	}
}
