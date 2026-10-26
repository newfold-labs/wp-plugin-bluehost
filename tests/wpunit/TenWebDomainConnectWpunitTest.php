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

	/** @covers \Bluehost\TenWebDomainConnect::set_mfe_script_type_module */
	public function test_set_mfe_script_type_module_only_for_mfe_handle(): void {
		$service = new TenWebDomainConnect();
		$tag     = '<script src="https://example.test/main.js"></script>';

		$this->assertSame( $tag, $service->set_mfe_script_type_module( $tag, 'other-handle', '' ) );
		$this->assertStringContainsString(
			'type="module"',
			$service->set_mfe_script_type_module( $tag, TenWebDomainConnect::HANDLE_MFE, '' )
		);
	}

	/** @covers \Bluehost\TenWebDomainConnect::set_mfe_script_type_module */
	public function test_set_mfe_script_type_module_does_not_duplicate_type_attribute(): void {
		$service = new TenWebDomainConnect();
		$tag     = '<script type="module" src="https://example.test/main.js"></script>';

		$this->assertSame(
			$tag,
			$service->set_mfe_script_type_module( $tag, TenWebDomainConnect::HANDLE_MFE, '' )
		);
	}

	/** @covers \Bluehost\TenWebDomainConnect::is_wvc_editor_request */
	public function test_is_wvc_editor_request_false_on_frontend(): void {
		$service = new TenWebDomainConnect();
		$this->assertFalse( $service->is_wvc_editor_request() );
	}
}
