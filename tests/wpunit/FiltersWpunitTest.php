<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Filters (Hiive headers, etc.).
 *
 * @coversDefaultClass \Bluehost\Filters
 */
class FiltersWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Filters.php' );
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_url_not_hiive(): void {
		$args = array(
			'method'  => 'GET',
			'headers' => array( 'Accept' => 'application/json' ),
		);
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://example.com/api' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_headers_missing(): void {
		$args = array( 'method' => 'GET' );
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://other.org/feed' );
		$this->assertSame( $args, $result );
	}
}
