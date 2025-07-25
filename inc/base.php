<?php
/**
 * Base functions
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * Check if plugin install date exists.
 *
 * @return bool
 */
function bluehost_has_plugin_install_date() {
	return ! empty( get_option( 'bluehost_plugin_install_date', '' ) );
}

/**
 * Get the plugin install date.
 *
 * @return string
 */
function bluehost_get_plugin_install_date() {
	return (string) get_option( 'bluehost_plugin_install_date', gmdate( 'U' ) );
}

/**
 * Set the plugin install date.
 *
 * @param string $value Date in Unix timestamp format.
 */
function bluehost_set_plugin_install_date( $value ) {
	update_option( 'bluehost_plugin_install_date', $value, true );
}


/**
 * Get the number of days since the plugin was installed.
 *
 * @return int
 */
function bluehost_get_days_since_plugin_install_date() {
	return absint( ( gmdate( 'U' ) - bluehost_get_plugin_install_date() ) / DAY_IN_SECONDS );
}

/**
 * Basic setup
 */
function bluehost_setup() {
	if ( ( '' === get_option( 'mm_master_aff' ) || false === get_option( 'mm_master_aff' ) ) && defined( 'MMAFF' ) ) {
		update_option( 'mm_master_aff', MMAFF );
	}
	$install_date = get_option( 'mm_install_date' );
	if ( empty( $install_date ) ) {
		update_option( 'mm_install_date', date( 'M d, Y' ) ); // phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
		$event                            = array(
			't'    => 'event',
			'ec'   => 'plugin_status',
			'ea'   => 'installed',
			'el'   => 'Install date: ' . get_option( 'mm_install_date', date( 'M d, Y' ) ),  // phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
			'keep' => false,
		);
		$events                           = get_option( 'mm_cron', array() );
		$events['hourly'][ $event['ea'] ] = $event;
		update_option( 'mm_cron', $events );
	}
	if ( ! bluehost_has_plugin_install_date() ) {
		$date = false;
		if ( ! empty( $install_date ) ) {
			$date = \DateTime::createFromFormat( 'M d, Y', $install_date );
		}
		bluehost_set_plugin_install_date( $date ? $date->format( 'U' ) : gmdate( 'U' ) );
	}
}

add_action( 'admin_init', __NAMESPACE__ . '\\bluehost_setup' );


/**
 * Filter the date used in data module
 *
 * @return int
 */
function bluehost_install_date_filter() {
	return bluehost_get_plugin_install_date();
}
add_filter( 'nfd_install_date_filter', __NAMESPACE__ . '\\bluehost_install_date_filter' );

/**
 * SVG allowed tags for kses
 *
 * Exampl use: wp_kses( $svg, KSES_ALLOWED_SVG_TAGS );
 */
const KSES_ALLOWED_SVG_TAGS = array(
	'svg'  => array(
		'class'        => true,
		'fill'         => true,
		'height'       => true,
		'stroke'       => true,
		'stroke-width' => true,
		'viewbox'      => true,
		'width'        => true,
		'xmlns'        => true,
	),
	'g'    => array(
		'fill'              => true,
		'stroke'            => true,
		'stroke-miterlimit' => true,
		'stroke-width'      => true,
	),
	'rect' => array(
		'fill'      => true,
		'height'    => true,
		'rx'        => true,
		'transform' => true,
		'width'     => true,
		'x'         => true,
		'y'         => true,
	),
	'text' => array(
		'fill'        => true,
		'font-family' => true,
		'font-size'   => true,
		'font-weight' => true,
		'title'       => true,
		'transform'   => true,
	),
	'path' => array(
		'd'               => true,
		'fill'            => true,
		'opacity'         => true,
		'stroke-linecap'  => true,
		'stroke-linejoin' => true,
		'transform'       => true,

	),
);
