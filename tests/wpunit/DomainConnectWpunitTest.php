<?php

namespace Bluehost;

/**
 * WPUnit tests for the domain-connect MFE context route.
 *
 * @coversDefaultClass \Bluehost\RestApi\DomainConnectController
 */
class DomainConnectWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		$root = codecept_root_dir();
		require_once $root . 'inc/RestApi/DomainConnectController.php';
	}

	/** @covers \Bluehost\RestApi\DomainConnectController::register_routes */
	public function test_domain_connect_route_registered(): void {
		$controller = new \Bluehost\RestApi\DomainConnectController();
		add_action( 'rest_api_init', array( $controller, 'register_routes' ) );
		do_action( 'rest_api_init' );
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/bluehost/v1/domain-connect/context', $routes );
		remove_action( 'rest_api_init', array( $controller, 'register_routes' ) );
	}

	/** @covers \Bluehost\RestApi\DomainConnectController::check_permission */
	public function test_domain_connect_requires_editor_permission(): void {
		$controller = new \Bluehost\RestApi\DomainConnectController();
		wp_set_current_user( 0 );
		$result = $controller->check_permission();
		$this->assertWPError( $result );

		$editor = $this->factory()->user->create_and_get( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor->ID );
		$this->assertTrue( $controller->check_permission() );
	}
}
