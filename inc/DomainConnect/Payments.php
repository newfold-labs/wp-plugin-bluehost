<?php

namespace Bluehost\DomainConnect;

use Bluehost\TenWebDomainConnect;

/**
 * Endpoint for the authenticated browser-side payment eligibility check.
 */
class Payments {

	/**
	 * Keep payment checks in the same environment as the checkout MFE.
	 *
	 * @return string
	 */
	public static function get_endpoint() {
		$base_url = TenWebDomainConnect::use_qa_environment()
			? 'https://sfbff-user-service-bh-qa.apis.newfold.com'
			: 'https://sfbff.bluehost.com';

		return $base_url . '/api/v1/ms-shopping/get-payments';
	}
}
