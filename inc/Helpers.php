<?php
/**
 * Generic helper utilities for the plugin.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * Class Helpers
 */
final class Helpers {

	/**
	 * Read an SVG asset from `assets/svg/`.
	 *
	 * Returns the file contents verbatim. Callers must sanitize with `wp_kses`
	 * (using `KSES_ALLOWED_SVG_TAGS` from `inc/base.php`) before echoing.
	 *
	 * @param string $name File name with or without the `.svg` extension
	 *                     (e.g. `bluehost-grid-mark` or `bluehost-grid-mark.svg`).
	 *
	 * @return string Raw SVG markup, or an empty string if missing/unreadable.
	 */
	public static function get_svg( $name ) {
		// basename() hardens against path traversal — `assets/svg/` is the only
		// allowed source directory, regardless of what callers pass in.
		$name = basename( preg_replace( '/\.svg$/', '', (string) $name ) ) . '.svg';
		$path = BLUEHOST_PLUGIN_DIR . 'assets/svg/' . $name;

		if ( ! is_readable( $path ) ) {
			return '';
		}

		$svg = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin asset.

		return false === $svg ? '' : $svg;
	}
}
