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
		delete_transient( 'nfd_ai_chat_jarvis_jwt' );
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
		update_option( 'blogname', 'My Cool Site!!!' );
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
		$this->assertSame( 'my-cool-site', $result['suggestedName'] );
		$this->assertArrayNotHasKey( 'userId', $result );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_uses_jarvis_jwt_from_hiive_customer(): void {
		$jwt = $this->synthetic_jwt();
		$this->mock_hiive_customer(
			array(
				'site_id'     => 5,
				'customer_id' => 'WN.HP.1',
				'jarvis_jwt'  => $jwt,
			)
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertIsArray( $result );
		$this->assertSame( $jwt, $result['userJwt'] );
		$this->assertSame( 'WN.HP.1', $result['productInstanceId'] );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_prefers_explicit_product_instance_id_field(): void {
		$jwt = $this->synthetic_jwt();
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);
		$this->mock_hiive_customer(
			array(
				'site_id'               => 10,
				'customer_id'           => 'WN.HP.legacy',
				'product_instance_id'   => 'pi-explicit',
			)
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertIsArray( $result );
		$this->assertSame( 'pi-explicit', $result['productInstanceId'] );
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

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_rejects_malformed_jwt(): void {
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () {
				return 'not-a-jwt';
			}
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertWPError( $result );
		$this->assertSame( 'bluehost_domain_connect_jwt_invalid', $result->get_error_code() );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_fails_when_hiive_is_not_connected(): void {
		delete_option( 'nfd_data_token' );

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertWPError( $result );
		$this->assertSame( 'jarvis_jwt_fetch_failed', $result->get_error_code() );
	}

	/** @covers \Bluehost\DomainConnect\Context::get_init_context */
	public function test_get_init_context_fails_when_site_id_missing(): void {
		$jwt = $this->synthetic_jwt();
		add_filter(
			'newfold/tenweb/filter/domain_connect_user_jwt',
			static function () use ( $jwt ) {
				return $jwt;
			}
		);
		$this->mock_hiive_customer(
			array(
				'customer_id' => 'WN.HP.88',
			)
		);

		$result = ( new \Bluehost\DomainConnect\Context() )->get_init_context();

		$this->assertWPError( $result );
		$this->assertSame( 'bluehost_domain_connect_site_id', $result->get_error_code() );
	}
}
