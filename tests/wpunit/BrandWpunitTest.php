<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Brand.
 *
 * @coversDefaultClass \Bluehost\Brand
 */
class BrandWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Brand.php' );
	}

	protected function tearDown(): void {
		\delete_option( 'mm_brand' );
		parent::tearDown();
	}

	public function test_is_india_false_by_default(): void {
		$this->assertFalse( Brand::is_india() );
	}

	public function test_is_india_true_for_india_brand_option(): void {
		\update_option( 'mm_brand', 'Bluehost_India' );
		$this->assertTrue( Brand::is_india() );
	}

	public function test_link_resolves_us_and_india(): void {
		$this->assertSame( 'https://my.bluehost.com', Brand::link( 'account' ) );
		$this->assertSame( 'https://my.bluehost.in', Brand::link( 'account', true ) );
		$this->assertSame( '', Brand::link( 'nope' ) );
	}

	public function test_register_sets_editor_chat_payload_for_us(): void {
		$container = $this->container_stub();
		Brand::register( $container );

		$payload = $container->store['editor_chat_brand'];
		$this->assertSame( 'bluehost', $payload['id'] );
		$this->assertSame( 'Bluehost', $payload['name'] );
		$this->assertSame( 'https://my.bluehost.com', $payload['accountUrl'] );
		$this->assertSame( 'https://www.bluehost.com/my-account/billing-center-v2', $payload['billingUrl'] );
		$this->assertArrayHasKey( 'adminUrl', $payload );
	}

	public function test_register_sets_india_links(): void {
		\update_option( 'mm_brand', 'Bluehost_India' );
		$container = $this->container_stub();
		Brand::register( $container );

		$payload = $container->store['editor_chat_brand'];
		$this->assertSame( 'bluehost', $payload['id'] );
		$this->assertSame( 'https://my.bluehost.in', $payload['accountUrl'] );
		$this->assertStringStartsWith( 'https://my.bluehost.in/', $payload['emailUrl'] );
	}

	private function container_stub() {
		return new class() {
			public $store = array();
			public function set( $key, $value ) {
				$this->store[ $key ] = $value;
			}
		};
	}
}
