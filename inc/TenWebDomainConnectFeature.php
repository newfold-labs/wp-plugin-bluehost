<?php

namespace Bluehost;

/**
 * Feature flag for the Bluehost domain-connect MFE inside the 10Web editor.
 */
class TenWebDomainConnectFeature extends \NewfoldLabs\WP\Module\Features\Feature {

	/**
	 * Feature name.
	 *
	 * @var string
	 */
	protected $name = 'tenwebDomainConnect';

	/**
	 * Enabled by default.
	 *
	 * @var bool
	 */
	protected $value = true;

	/**
	 * Initialize the editor integration.
	 */
	protected function initialize() {
		new TenWebDomainConnect();
	}
}
