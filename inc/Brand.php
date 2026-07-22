<?php
/**
 * Brand-level constants for the plugin's PHP-rendered surfaces.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * Class Brand
 */
final class Brand {

	/**
	 * Background color for brand-styled buttons rendered outside the React app
	 * (e.g. the "Login with Bluehost" button on wp-login.php).
	 *
	 * Note: this is intentionally distinct from the Tailwind `primary.DEFAULT`
	 * used by the admin UI — they are not currently in sync.
	 */
	const BUTTON_BACKGROUND = '#1b4fd8';
}
