<?php

namespace Bluehost;

/**
 * WPUnit tests for domain-connect shopper context resolution.
 *
 * @coversDefaultClass \Bluehost\DomainConnect\Context
 */
class DomainConnectContextWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * @var callable|null
	 */
	private $hiive_http_filter;

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir() . 'inc/DomainConnect/Context.php';
	}

	protected function tearDown(): void {
		if ( $this->hiive_http_filter ) {
			remove_filter( 'pre_http_request', $this->hiive_http_filter, 10 );
			$this->hiive_http_filter = null;
		}
		remove_all_filters( 'newfold/tenweb/filter/domain_connect_user_jwt' );
		delete_option( 'nfd_data_token' );
		parent::tearDown();
	}

	/**
	 * Build a minimal valid Jarvis user JWT for tests.
	 *
	 * @param array $claims Optional claim overrides.
	 * @return string
	 */
	private function synthetic_jwt( array $claims = array() ) {
		$payload = array_merge(
			array(
				'iss' => 'jarvis-jwt',
				'sub' => 'urn:jarvis:bluehost:account:1001',
				'act' => array( 'sub' => 'urn:jarvis:bluehost:user:2002' ),
				'exp' => time() + 3600,
			),
			$claims
		);

		$segment = rtrim( strtr( base64_encode( wp_json_encode( $payload ) ), '+/', '-_' ), '=' );

		return 'hdr.' . $segment . '.sig';
	}

	/**
	 * @param string   $method_name Private method on Context.
	 * @param mixed ...$args        Method arguments.
	 * @return mixed
	 */
	private function invoke_context( $method_name, ...$args ) {
		$context = new \Bluehost\DomainConnect\Context();
		$method  = new \ReflectionMethod( $context, $method_name );

		return $method->invoke( $context, ...$args );
	}

	/**
	 * @param array $customer Hiive customer JSON body.
	 */
	private function mock_hiive_customer( array $customer ) {
		update_option( 'nfd_data_token', 'wpunit-test-token' );
		$this->hiive_http_filter = function ( $pre, $args, $url ) use ( $customer ) {
			if ( false !== strpos( $url, '/sites/v1/customer' ) ) {
				return array(
					'headers'  => array(),
					'body'     => wp_json_encode( $customer ),
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
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_returns_mfe_payload(): void {
		$jwt = $this->synthetic_jwt();
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);
		$this->mock_hiive_customer(
			array(
				'site_id'     => 42,
				'customer_id' => 'WN.HP.99',
			)
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertIsArray( $result );
		$this->assertSame( 1001, $result['accountId'] );
		$this->assertSame( $jwt, $result['userJwt'] );
		$this->assertSame( 42, $result['siteId'] );
		$this->assertSame( 'WN.HP.99', $result['productInstanceId'] );
		$this->assertArrayNotHasKey( 'userId', $result );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_requires_product_instance_id(): void {
		$jwt = $this->synthetic_jwt();
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);
		$this->mock_hiive_customer(
			array(
				'site_id'     => 7,
				'customer_id' => '12345',
			)
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertWPError( $result );
		$this->assertSame( 'bluehost_domain_connect_product_instance', $result->get_error_code() );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_rejects_jwt_missing_claims(): void {
		$jwt = $this->synthetic_jwt(
			array(
				'sub' => 'invalid',
				'act' => array( 'sub' => 'invalid' ),
			)
		);
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertWPError( $result );
		$this->assertSame( 'bluehost_domain_connect_jwt_claims', $result->get_error_code() );
	}

	/** @covers \Bluehost\DomainConnect\Context::resolve_product_instance_id */
	public function test_resolve_product_instance_id_prefers_explicit_fields(): void {
		$this->assertSame(
			'pi-explicit',
			$this->invoke_context( 'resolve_product_instance_id', array( 'product_instance_id' => 'pi-explicit' ) )
		);
		$this->assertSame(
			'WN.HP.77',
			$this->invoke_context( 'resolve_product_instance_id', array( 'customer_id' => 'WN.HP.77' ) )
		);
		$this->assertSame(
			'',
			$this->invoke_context( 'resolve_product_instance_id', array( 'customer_id' => '99999' ) )
		);
	}

	/** @covers \Bluehost\DomainConnect\Context::decode_jwt_payload */
	public function test_decode_jwt_payload_rejects_malformed_token(): void {
		$result = $this->invoke_context( 'decode_jwt_payload', 'not-a-jwt' );
		$this->assertWPError( $result );
		$this->assertSame( 'bluehost_domain_connect_jwt_invalid', $result->get_error_code() );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_suggested_name */
	public function test_get_suggested_name_sanitizes_blog_title(): void {
		update_option( 'blogname', 'My Cool Site!!!' );
		$this->assertSame( 'my-cool-site', $this->invoke_context( 'get_suggested_name' ) );
	}

	/** @covers \Bluehost\DomainConnect\Context::parse_urn_id */
	public function test_parse_urn_id_extracts_numeric_id(): void {
		$this->assertSame( 55, $this->invoke_context( 'parse_urn_id', 'urn:jarvis:bluehost:account:55', 'account' ) );
		$this->assertSame( 0, $this->invoke_context( 'parse_urn_id', '', 'user' ) );
	}
}
