<?php

namespace Bluehost;

use Bluehost\DomainConnect\Payments;

/**
 * @coversDefaultClass \Bluehost\DomainConnect\Payments
 */
class DomainConnectPaymentsWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir() . 'inc/DomainConnect/Payments.php';
		require_once codecept_root_dir() . 'inc/TenWebDomainConnect.php';
	}

	/** @covers ::get_endpoint */
	public function test_payment_endpoint_matches_mfe_environment(): void {
		$filter = 'newfold/tenweb/filter/domain_connect_use_qa_mfe';
		add_filter( $filter, '__return_false' );
		$this->assertSame( 'https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments', Payments::get_endpoint() );
		remove_filter( $filter, '__return_false' );
		add_filter( $filter, '__return_true' );
		$this->assertSame( 'https://sfbff-user-service-bh-qa.apis.newfold.com/api/v1/ms-shopping/get-payments', Payments::get_endpoint() );
		remove_filter( $filter, '__return_true' );
	}
}
