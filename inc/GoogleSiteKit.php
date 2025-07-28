<?php

namespace Bluehost;

/**
 * Class GoogleSiteKit
 *
 * @package Bluehost
 */
class GoogleSiteKit {

	/**
	 * GoogleSiteKit constructor.
	 */
	public function __construct() {
		add_action( 'pre_set_transient_nfd_site_capabilities', array( $this, 'maybe_enable_google_site_kit' ), 10, 3 );
	}

	/**
	 * Check if Google Site Kit is enabled and set the transient value.
	 *
	 * @param mixed $value The transient value.
	 *
	 * @return mixed
	 */
	public function maybe_enable_google_site_kit( $value ) {
		if ( class_exists( 'WPSEO_Options' ) ) {
			$option_value = \WPSEO_Options::get( 'google_site_kit_feature_enabled', null, array( 'wpseo' ) );
			if (
				! $option_value &&
				is_array( $value ) &&
				array_key_exists( 'google_site_kit_feature_enabled', $value ) &&
				true === $value['google_site_kit_feature_enabled']
			) {
				\WPSEO_Options::set( 'google_site_kit_feature_enabled', true, 'wpseo' );
			}
		}
		return $value;
	}
}

new GoogleSiteKit();
