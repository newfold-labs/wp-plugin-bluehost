<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use NewfoldLabs\WP\Module\Solutions\Solutions;

/**
 * \Bluehost\Data
 * This class does not have a constructor to get instantiated, just static methods.
 */
final class Data {

	/**
	 * Data loaded onto window.NewfoldRuntime
	 *
	 * @return array
	 */
	public static function runtime() {
		global $nfd_module_container;

		$runtime = array(
			'plugin'    => array(
				'url'     => BLUEHOST_BUILD_URL,
				'version' => BLUEHOST_PLUGIN_VERSION,
				'assets'  => BLUEHOST_PLUGIN_URL . 'assets/',
				'brand'   => $nfd_module_container->plugin()->brand,
			),
			'wordpress' => array(
				'isBlockTheme' => function_exists( 'wp_is_block_theme' ) ? wp_is_block_theme() : false,
			),
			'siteType'  => self::get_site_type(),
		);

		if ( class_exists( 'NewfoldLabs\WP\Module\Solutions\Solutions' ) ) {
			$solution_data        = Solutions::get_enhanced_entitlment_data();
			$solution             = is_array( $solution_data ) && array_key_exists( 'solution', $solution_data ) ? $solution_data['solution'] : false;
			$runtime['solutions'] = array(
				'solution'   => $solution,
				'wondercart' => self::get_entitlement_by_id( $solution_data, 'WonderCart' ),
			);
		}

		// Add solution ecom family ctb to runtime
		$runtime['ctbs'] = array(
			'ecomFamily' => array(
				'id'  => '5dc83bdd-9274-4557-a6d7-0b2adbc3919f',
				'url' => 'https://www.bluehost.com/my-account/hosting/details#click-to-buy-WP_SOLUTION_FAMILY',
			),
		);

		return $runtime;
	}

	/**
	 * Get entitlement by ID from solution data
	 *
	 * @param array  $solution_data The solution data array
	 * @param string $entitlement_name The entitlement name to search for
	 * @return array|false The entitlement data if found, false otherwise
	 */
	public static function get_entitlement_by_id( $solution_data, $entitlement_name ) {
		if ( ! isset( $solution_data['entitlements'] ) || ! is_array( $solution_data['entitlements'] ) ) {
			return false;
		}

		foreach ( $solution_data['entitlements'] as $entitlement ) {
			if ( isset( $entitlement['name'] ) && $entitlement['name'] === $entitlement_name ) {
				return $entitlement;
			}
		}

		return false;
	}

	/**
	 * Get site type from onboarding data
	 *
	 * @return string The site type
	 */
	public static function get_site_type() {
		// Option name for onboarding site info
		$ONBOARDING_SITE_INFO_OPTION = 'nfd_module_onboarding_site_info';

		/**
		 * Available plan types, this maps the site_type from onboarding module to internal plan types
		 * Maps the site_type to the site type for the runtime data
		 */
		$SITE_TYPES = array(
			'personal'  => 'blog',
			'business'  => 'website',
			'ecommerce' => 'store',
		);

		if ( is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
			return 'store';
		}

		$onboarding_data = \get_option( $ONBOARDING_SITE_INFO_OPTION, array() );
		$site_type       = $onboarding_data['site_type'] ?? '';
		if ( ! empty( $site_type ) && \array_key_exists( $site_type, $SITE_TYPES ) ) {
			return $SITE_TYPES[ $site_type ];
		}

		return 'website';
	}
}
