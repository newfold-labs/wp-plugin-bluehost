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
			'plugin' => array(
				'url'     => BLUEHOST_BUILD_URL,
				'version' => BLUEHOST_PLUGIN_VERSION,
				'assets'  => BLUEHOST_PLUGIN_URL . 'assets/',
				'brand'   => $nfd_module_container->plugin()->brand,
			),
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
}
