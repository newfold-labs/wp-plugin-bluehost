<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost REST API (settings route registration and permission).
 *
 * @coversDefaultClass \Bluehost\RestApi\SettingsController
 */
class RestApiWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/RestApi/SettingsController.php' );
		require_once codecept_root_dir( 'inc/RestApi/rest-api.php' );
	}

	/** @covers \Bluehost\init_rest_api */
	public function test_bluehost_v1_settings_route_registered(): void {
		do_action( 'rest_api_init' );
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/bluehost/v1/settings', $routes );
	}

	/** @covers \Bluehost\RestApi\SettingsController::register_routes */
	public function test_settings_route_supports_get_and_edit_methods(): void {
		do_action( 'rest_api_init' );
		$route = rest_get_server()->get_routes()['/bluehost/v1/settings'] ?? null;
		$this->assertNotNull( $route );
		$all_methods = array();
		foreach ( $route as $endpoint ) {
			$all_methods = array_merge( $all_methods, array_keys( $endpoint['methods'] ?? array() ) );
		}
		$this->assertContains( 'GET', $all_methods );
		$has_editable = in_array( 'POST', $all_methods, true ) || in_array( 'PUT', $all_methods, true ) || in_array( 'PATCH', $all_methods, true );
		$this->assertTrue( $has_editable, 'Settings route should support an editable method (POST/PUT/PATCH)' );
	}

	/** @covers \Bluehost\RestApi\SettingsController::check_permission */
	public function test_settings_get_requires_authentication(): void {
		do_action( 'rest_api_init' );
		wp_set_current_user( 0 );
		$request  = new \WP_REST_Request( 'GET', '/bluehost/v1/settings' );
		$response = rest_do_request( $request );
		$this->assertTrue( $response->is_error(), 'Unauthenticated request should return an error' );
		$data = $response->get_data();
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'code', $data );
		$this->assertSame( 'rest_forbidden_context', $data['code'] );
		$this->assertSame( 401, $response->get_status() );
	}

	/** @covers \Bluehost\RestApi\SettingsController::check_permission */
	public function test_settings_permission_allows_administrator(): void {
		$controller = new \Bluehost\RestApi\SettingsController();
		$admin      = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin->ID );
		$result = $controller->check_permission();
		$this->assertTrue( $result, 'Administrator should pass permission check' );
	}
}
