<?php

namespace Bluehost;

/**
 * WPUnit tests for the Bluehost domain-search gateway.
 *
 * @coversDefaultClass \Bluehost\RestApi\DomainSearchController
 */
class DomainSearchWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		$root = codecept_root_dir();
		require_once $root . 'inc/RestApi/DomainSearchController.php';
	}

	/** @covers \Bluehost\RestApi\DomainSearchController::register_routes */
	public function test_domain_search_route_registered(): void {
		$controller = new \Bluehost\RestApi\DomainSearchController();
		add_action( 'rest_api_init', array( $controller, 'register_routes' ) );
		do_action( 'rest_api_init' );
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/bluehost/v1/domains/search', $routes );
		remove_action( 'rest_api_init', array( $controller, 'register_routes' ) );
	}

	/** @covers \Bluehost\RestApi\DomainSearchController::check_permission */
	public function test_domain_search_requires_editor_permission(): void {
		$controller = new \Bluehost\RestApi\DomainSearchController();
		wp_set_current_user( 0 );
		$result = $controller->check_permission();
		$this->assertWPError( $result );

		$editor = $this->factory()->user->create_and_get( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor->ID );
		$this->assertTrue( $controller->check_permission() );
	}

	/** @covers \Bluehost\RestApi\DomainSearchController::build_url */
	public function test_build_url_uses_expected_sfbff_endpoint(): void {
		$controller = new \Bluehost\RestApi\DomainSearchController();
		$url        = $controller->build_url( 'Example.com', 'search' );
		$this->assertStringStartsWith( \Bluehost\RestApi\DomainSearchController::API_BASE, $url );
		$this->assertStringContainsString( 'domains=example.com', $url );
		$this->assertStringContainsString( 'brand=BLUEHOST', $url );
		$this->assertStringContainsString( 'tldOrder=.com', urldecode( $url ) );
	}

	/** @covers \Bluehost\RestApi\DomainSearchController::normalize_response */
	public function test_normalize_response_deduplicates_and_preserves_prices(): void {
		$domain = array(
			'domainName'                => 'example.com',
			'isAvailable'               => true,
			'unitPrice'                 => 12.99,
			'unitPriceWithCurrency'     => '$12.99',
			'renewPrice'                => 23.99,
			'renewPriceWithCurrency'    => '$23.99',
			'currency'                  => 'USD',
			'term'                      => '1 year',
			'isPremium'                 => false,
			'isAftermarket'             => false,
		);
		$result = \Bluehost\RestApi\DomainSearchController::normalize_response(
			array(
				'trace'    => 'trace-id',
				'response' => array(
					'data' => array(
						'searchedDomains' => array( $domain ),
						'spinDomains'     => array( $domain ),
					),
				),
			)
		);

		$this->assertCount( 1, $result['results'] );
		$this->assertSame( 'example.com', $result['results'][0]['domainName'] );
		$this->assertSame( 12.99, $result['results'][0]['price'] );
		$this->assertSame( '$23.99', $result['results'][0]['renewPriceWithCurrency'] );
		$this->assertSame( 'trace-id', $result['trace'] );
	}

	/** @covers \Bluehost\RestApi\DomainSearchController::search */
	public function test_search_returns_normalized_remote_results(): void {
		$controller = new \Bluehost\RestApi\DomainSearchController();
		$editor     = $this->factory()->user->create_and_get( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor->ID );

		add_filter(
			'pre_http_request',
			static function () {
				return array(
					'headers'  => array(),
					'response' => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'body'     => wp_json_encode(
						array(
							'response' => array(
								'data' => array(
									'searchedDomains' => array(
										array(
											'domainName'            => 'available-example.com',
											'isAvailable'           => true,
											'unitPriceWithCurrency' => '$12.99',
										),
									),
								),
							),
						)
					),
					'cookies'  => array(),
					'filename' => null,
				);
			}
		);

		$request = new \WP_REST_Request( 'GET', '/bluehost/v1/domains/search' );
		$request->set_param( 'query', 'available-example.com' );
		$request->set_param( 'mode', 'search' );
		$response = $controller->search( $request );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( 'available-example.com', $response->get_data()['results'][0]['domainName'] );
		remove_all_filters( 'pre_http_request' );
	}
}
