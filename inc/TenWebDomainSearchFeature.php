<?php

namespace Bluehost;

/**
 * Feature flag for the Bluehost domain search inside the 10Web editor.
 */
class TenWebDomainSearchFeature extends \NewfoldLabs\WP\Module\Features\Feature {

	/**
	 * Feature name.
	 *
	 * @var string
	 */
	protected $name = 'tenwebDomainSearch';

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
		new TenWebDomainSearch();
	}
}
