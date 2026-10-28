<?php

namespace Bluehost;

/**
 * WPUnit tests for the domain-connect MFE context route.
 *
 * @coversDefaultClass \Bluehost\RestApi\DomainConnectController
 */
class DomainConnectWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * @var callable|null
	 */
	private $hiive_http_filter;

	protected function setUp(): void {
		parent::setUp();
		$root = codecept_root_dir();
		require_once $root . 'inc/DomainConnect/Context.php';
		require_once $root . 'inc/DomainConnect/Payments.php';
		require_once $root . 'inc/TenWebDomainConnect.php';
		require_once $root . 'inc/RestApi/DomainConnectController.php';
	}

	protected function tearDown(): void {
		if ( $this->hiive_http_filter ) {
			remove_filter( 'pre_http_request', $this->hiive_http_filter, 10 );
			$this->hiive_http_filter = null;
		}
		remove_all_filters( 'newfold/tenweb/filter/domain_connect_user_jwt' );
		delete_option( 'nfd_data_token' );
		delete_transient( 'nfd_ai_chat_jarvis_jwt' );
		parent::tearDown();
	}

	/**
	 * @return string
	 */
	private function synthetic_jwt() {
		$payload = array(
			'iss' => 'jarvis-jwt',
			'sub' => 'urn:jarvis:bluehost:account:11',
			'act' => array( 'sub' => 'urn:jarvis:bluehost:user:22' ),
			'exp' => time() + 3600,
		);
		$segment = rtrim( strtr( base64_encode( wp_json_encode( $payload ) ), '+/', '-_' ), '=' );

		return 'hdr.' . $segment . '.sig';
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

	/** @covers \Bluehost\RestApi\DomainConnectController::get_context */
	public function test_get_context_returns_init_payload_for_editor(): void {
		$jwt = $this->synthetic_jwt();
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);
		update_option( 'nfd_data_token', 'wpunit-test-token' );
		$this->hiive_http_filter = function ( $pre, $args, $url ) {
			if ( false !== strpos( $url, '/sites/v1/customer' ) ) {
				return array(
					'headers'  => array(),
					'body'     => wp_json_encode(
						array(
							'site_id'     => 3,
							'customer_id' => 'WN.HP.5',
						)
					),
					'response' => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'cookies'  => array(),
					'filename' => null,
				);
			}

			return $pre;
		};
		add_filter( 'pre_http_request', $this->hiive_http_filter, 10, 3 );

		$controller = new \Bluehost\RestApi\DomainConnectController();
		add_action( 'rest_api_init', array( $controller, 'register_routes' ) );
		do_action( 'rest_api_init' );

		$editor = $this->factory()->user->create_and_get( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor->ID );

		$request  = new \WP_REST_Request( 'GET', '/bluehost/v1/domain-connect/context' );
		$response = rest_do_request( $request );

		$this->assertFalse( $response->is_error() );
		$data = $response->get_data();
		$this->assertSame( 3, $data['siteId'] );
		$this->assertSame( 'WN.HP.5', $data['productInstanceId'] );
		$this->assertSame( \Bluehost\DomainConnect\Payments::get_endpoint(), $data['paymentsUrl'] );
		$this->assertArrayNotHasKey( 'eligible', $data );
		$this->assertSame( 'no-store', $response->get_headers()['Cache-Control'] );

		remove_action( 'rest_api_init', array( $controller, 'register_routes' ) );
	}
}
