<?php
/**
 * Account Widget View
 *
 * This is rendered on the WordPress dashboard Bluehost Account widget.
 * Icon svgs from HeroIcons https://heroicons.com/
 *
 * @package WPPluginBluehost
 */

use function NewfoldLabs\WP\ModuleLoader\container;
use function NewfoldLabs\WP\Context\getContext;

// Helper methods for links : move these elsewhere so they can be reused?

/**
 * Add UTM params to a URL
 *
 * @param string $url the URL
 * @return string the URL with UTM params
 */
function add_utm_params( $url ) {
	$data        = array(
		'utm_source' => 'wp-admin/index.php?widget=bluehost_account_widget',
		'utm_medium' => 'bluehost_plugin',
	);
	return $url .= '?' . http_build_query( $data );
}

/**
 * Check if the user is Jarvis
 *
 * @return bool
 */
function is_jarvis() {
	$capabilities = container()->get( 'capabilities' )->all();
	if ( isset( $capabilities['isJarvis'] ) && $capabilities['isJarvis'] ) {
		return true;
	}
	return false;
}

/**
 * Get the platform path URL
 *
 * @param string $jarvisPath the jarvis path
 * @param string $legacyPath the legacy path
 * @return string platform link
 */
function get_platform_path_url( $jarvisPath = '', $legacyPath = '' ) {
	return is_jarvis() ?
		get_platform_base_url( '/my-account/' ) . $jarvisPath :
		get_platform_base_url( '/hosting/' ) . $legacyPath;
}

/**
 * Get the platform base URL
 *
 * @param string $path the path
 * @return string platform link
 */
function get_platform_base_url( $path = '' ) {
	$brand = getContext( 'brand' );

	if ( 'Bluehost_India' === $brand ) {
		return 'https://my.bluehost.in' . $path;
	}

	if ( is_jarvis() ) {
		return 'https://www.bluehost.com' . $path;
	} else {
		return 'https://my.bluehost.com' . $path;
	}
}

// assets/svg/bluehost-logo.svg
$logo_svg = file_get_contents( BLUEHOST_PLUGIN_DIR . '/assets/svg/bluehost-logo.svg' );
// need to base64 to keep the fill color intact
$logo_b64 = base64_encode( $logo_svg );

// reused class collections for easy edits
$box_li_classes = 'nfd-widget-account-box-li max-[575px]:nfd-items-start nfd-flex nfd-items-center nfd-justify-center nfd-card nfd-bg-canvas';
$box_a_classes  = 'nfd-widget-account-box-a nfd-flex nfd-flex-col nfd-gap-1 nfd-items-center nfd-text-center nfd-text-[#404040] hover:nfd-text-primary';
?>
<style>
	#bluehost_account_widget h2 {
		justify-content: start;
		gap: .5rem;
		font-size: 0; /* hides  text */
	}
	#bluehost_account_widget h2:before {
		content: url('data:image/svg+xml;base64,<?php echo esc_attr( $logo_b64 ); ?>');
		width: 100px;
		height: 1rem;
		padding: .5rem;
	}
	.nfd-widget-account a {
		color: #333;
	}
	.nfd-grid-cols-4 {
		grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
	}
	.nfd-root li.nfd-widget-account-box-li {
		padding: 0;
	}
	.nfd-widget-account-box-a {
		display: block;
		width: 100%;
		margin: 0 auto;
		padding: 1rem clamp(1rem, 20%, 1.5rem);
	}
</style>
<div class="nfd-root nfd-widget nfd-widget-account">
	<ul class="nfd-grid nfd-grid-cols-4 max-[575px]:nfd-grid-cols-2 nfd-gap-3 nfd-h-full">
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="
				<?php
					echo esc_url(
						is_jarvis() ?
							add_utm_params( get_platform_path_url( 'account-center' ) ) :
							add_utm_params( get_platform_base_url( '/cgi/token' ) )
					);
					?>
				"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
				</svg>
				<?php esc_html_e( 'Profile', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="
				<?php
					echo esc_url(
						add_utm_params(
							get_platform_path_url(
								'home',
								'app#/email-office'
							)
						)
					);
					?>
				"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
				</svg>
				<?php esc_html_e( 'Mail', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a 
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="
				<?php
				echo esc_url(
					add_utm_params(
						get_platform_path_url(
							'hosting/list',
							'app'
						)
					)
				);
				?>
				"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
				</svg>
				<?php esc_html_e( 'Hosting', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a 
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="
				<?php
					echo esc_url(
						add_utm_params(
							get_platform_path_url(
								'account-center',
								'account_center#security'
							)
						)
					);
					?>
				"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
				</svg>
				<?php esc_html_e( 'Security', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
	</ul>
	<p class="nfd-mt-4"><strong><?php esc_html_e( 'Quick Access', 'wp-plugin-bluehost' ); ?></strong></p>
	<ul class="nfd-mt-4">
		<li>
			<a
				target="_blank"
				href="
				<?php
					echo esc_url(
						add_utm_params(
							get_platform_path_url(
								'billing-center',
								'account_center#billing'
							)
						)
					);
					?>
				"
			>
				<?php esc_html_e( 'Payment Methods', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li>
			<a 
				target="_blank"
				href="
				<?php
					echo esc_url(
						add_utm_params(
							get_platform_path_url(
								'renewal-center',
								'account_center#products'
							)
						)
					);
					?>
				"
			>
				<?php esc_html_e( 'Renewals Center', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
	</ul>
</div>