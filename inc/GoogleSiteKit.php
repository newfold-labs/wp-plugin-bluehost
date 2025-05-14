<?php

namespace Bluehost;

class GoogleSiteKit {

	public function __construct() {
		add_action( 'pre_set_transient_nfd_site_capabilities', array( $this, 'maybe_enable_google_site_kit' ), 10, 3 );
	}

	public function maybe_enable_google_site_kit( $value, $expiration, $transient ) {
		if( class_exists('WPSEO_Options') ) {
            $option_value = \WPSEO_Options::get('google_site_kit_feature_enabled', null, ['wpseo']);
            if(
                !$option_value && 
                is_array($value) && 
                array_key_exists( 'google_site_kit_feature_enabled', $value ) && 
                true === $value['google_site_kit_feature_enabled']
            ) {
                \WPSEO_Options::set('google_site_kit_feature_enabled', true, 'wpseo');
            }
        }

		return $value;
	}
}

new GoogleSiteKit();