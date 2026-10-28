<?php

namespace Bluehost;

/**
 * WPUnit tests for the TenWeb domain-connect host loader.
 *
 * @coversDefaultClass \Bluehost\TenWebDomainConnect
 */
class TenWebDomainConnectWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir() . 'inc/TenWebDomainConnect.php';
	}

	/** @covers \Bluehost\TenWebDomainConnect::is_wvc_editor_request */
	public function test_is_wvc_editor_request_false_on_frontend(): void {
		$service = new TenWebDomainConnect();
		$this->assertFalse( $service->is_wvc_editor_request() );
	}

	/** @covers \Bluehost\TenWebDomainConnect::use_qa_environment */
	public function test_use_qa_environment_respects_filter(): void {
		$filter = 'newfold/tenweb/filter/domain_connect_use_qa_mfe';
		add_filter( $filter, '__return_false' );
		$this->assertFalse( TenWebDomainConnect::use_qa_environment() );
		remove_filter( $filter, '__return_false' );
		add_filter( $filter, '__return_true' );
		$this->assertTrue( TenWebDomainConnect::use_qa_environment() );
		remove_filter( $filter, '__return_true' );
	}
}
