<?php
/**
 * Brand constants and helpers for the Bluehost plugin.
 *
 * Single home for everything brand-shaped: visual constants, per-brand
 * (Bluehost US / Bluehost India) portal links, and the payload consumed by
 * wp-module-editor-chat via its container key.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

/**
 * Class Brand
 */
final class Brand {

	/**
	 * Brand identifier used by modules (editor-chat worker handshake, etc.).
	 */
	const ID = 'bluehost';

	/**
	 * Human-readable brand name.
	 */
	const NAME = 'Bluehost';

	/**
	 * Value of the `mm_brand` option / plugin brand for Bluehost India.
	 */
	const INDIA_BRAND = 'Bluehost_India';

	/**
	 * Background color for brand-styled buttons rendered outside the React app
	 * (e.g. the "Login with Bluehost" button on wp-login.php).
	 *
	 * Note: this is intentionally distinct from the Tailwind `primary.DEFAULT`
	 * used by the admin UI — they are not currently in sync.
	 */
	const BUTTON_BACKGROUND = '#1b4fd8';

	/**
	 * Container key consumed by wp-module-editor-chat.
	 */
	private const EDITOR_CHAT_CONTAINER_KEY = 'editor_chat_brand';

	/**
	 * Portal links per brand variant. `default` is Bluehost US.
	 */
	private const LINKS = array(
		'account' => array(
			'default' => 'https://my.bluehost.com',
			'india'   => 'https://my.bluehost.in',
		),
		'email'   => array(
			'default' => 'https://my.bluehost.com/hosting/app?lil=1#/email-office',
			'india'   => 'https://my.bluehost.in/hosting/app?lil=1#/email-office',
		),
		'billing' => array(
			'default' => 'https://www.bluehost.com/my-account/billing-center-v2',
			// Mirrors the previous wp-module-onboarding registry value for India.
			'india'   => 'https://www.bluehost.com/my-account/billing-center-v2',
		),
	);

	/**
	 * Whether this site is a Bluehost India site.
	 *
	 * Uses the same source as the `plugin` container entry in bootstrap.php.
	 *
	 * @return bool
	 */
	public static function is_india(): bool {
		$brand = \get_option( 'mm_brand', \apply_filters( 'newfold/container/plugin/brand', 'bluehost' ) );

		return self::INDIA_BRAND === $brand;
	}

	/**
	 * Resolve a portal link for the current (or specified) variant.
	 *
	 * @param string    $key   One of the LINKS top-level keys.
	 * @param bool|null $india Optional override; defaults to is_india().
	 *
	 * @return string URL, or empty string if the key is unknown.
	 */
	public static function link( string $key, ?bool $india = null ): string {
		if ( ! isset( self::LINKS[ $key ] ) ) {
			return '';
		}
		$india = $india ?? self::is_india();

		return self::LINKS[ $key ][ $india ? 'india' : 'default' ];
	}

	/**
	 * Register brand payloads on the module loader container.
	 *
	 * @param \NewfoldLabs\WP\ModuleLoader\Container $container Module container.
	 *
	 * @return void
	 */
	public static function register( $container ) {
		$container->set( self::EDITOR_CHAT_CONTAINER_KEY, self::editor_chat_payload() );
	}

	/**
	 * Payload for wp-module-editor-chat (`window.nfdEditorChat.brand`).
	 *
	 * Icons are omitted on purpose: editor-chat's built-in fallback marks are
	 * the Bluehost marks. Add an `icons` array (avatar, menu) here to override.
	 *
	 * @return array<string, mixed>
	 */
	private static function editor_chat_payload(): array {
		$build = static function ( string $url ): string {
			return \esc_url( (string) \apply_filters( 'nfd_build_url', $url ) );
		};

		return array(
			'id'         => self::ID,
			'name'       => self::NAME,
			'accountUrl' => $build( self::link( 'account' ) ),
			'emailUrl'   => $build( self::link( 'email' ) ),
			'billingUrl' => $build( self::link( 'billing' ) ),
			'adminUrl'   => \admin_url(),
		);
	}
}
