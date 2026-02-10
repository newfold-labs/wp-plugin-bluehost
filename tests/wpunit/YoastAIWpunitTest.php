<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\YoastAI.
 *
 * @coversDefaultClass \Bluehost\YoastAI
 */
class YoastAIWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/YoastAI.php' );
	}

	/** @covers \Bluehost\YoastAI::modify_http_request_args */
	public function test_modify_http_request_args_returns_unchanged_when_host_not_yoast_ai(): void {
		$args = array( 'method' => 'GET', 'headers' => array() );
		$result = \Bluehost\YoastAI::modify_http_request_args( $args, 'https://example.com/api' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\YoastAI::modify_http_request_args */
	public function test_modify_http_request_args_returns_unchanged_when_url_has_no_host(): void {
		$args = array( 'method' => 'POST' );
		$result = \Bluehost\YoastAI::modify_http_request_args( $args, 'https:///path-only' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\YoastAI::modify_http_request_args */
	public function test_modify_http_request_args_returns_args_for_yoast_ai_host(): void {
		$args = array( 'method' => 'GET' );
		$result = \Bluehost\YoastAI::modify_http_request_args( $args, 'https://ai.yoa.st/v1/something' );
		$this->assertSame( $args, $result );
	}
}
