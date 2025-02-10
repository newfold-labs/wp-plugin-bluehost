<?php
/**
 * Account Widget View
 * 
 * This is rendered on the WordPress dashboard Bluehost Account widget.
 * Icon svgs from HeroIcons https://heroicons.com/
 */
use function NewfoldLabs\WP\ModuleLoader\container;
use function NewfoldLabs\WP\Context\getContext;

// Helper methods for links
// TODO: move these elsewhere so they can be reused
function addUtmParams( $url ) {
	$data = array(
		'utm_source' => 'wp-admin/index.php?widget=bluehost_account_widget',
		'utm_medium' => 'bluehost_plugin',
	);
	return $url .= '?' . http_build_query( $data );
}
function isJarvis () {
	$capabilities = container()->get( 'capabilities' )->all();
	if ( isset( $capabilities['isJarvis'] ) && $capabilities['isJarvis'] ) {
		return true;
	}
	return false;
}
function getPlatformPathUrl( $jarvisPath = '', $legacyPath = '' ) {
	return isJarvis() ?
		getPlatformBaseUrl( '/my-account/' ) . $jarvisPath : 
		getPlatformBaseUrl( '/hosting/' ) . $legacyPath;
}
function getPlatformBaseUrl ( $path = '' ) {
	$brand = getContext( 'brand' );

	if ( $brand === 'Bluehost_India' ) {
		return 'https://my.bluehost.in' . $path;
	}

	if ( isJarvis() ) {
		return 'https://www.bluehost.com' . $path;
	} else {
		return 'https://my.bluehost.com' . $path;
	}
};
// assets/svg/bluehost-logo.svg
$logo_svg = file_get_contents( BLUEHOST_PLUGIN_DIR . '/assets/svg/bluehost-logo.svg' );
// $logo_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.8 19.3"><path fill="#3575D3" d="M0 0h5.3v5.3H0zm6.8 0h5.3v5.3H6.8zm6.9 0H19v5.3h-5.3zM0 6.8h5.3v5.3H0zm6.8 0h5.3v5.3H6.8zm6.9 0H19v5.3h-5.3zM0 13.7h5.3V19H0zm6.8 0h5.3V19H6.8zm6.9 0H19V19h-5.3zm16.1-5.5c1.1-1 2.5-1.5 4-1.5 2.7 0 5.3 1.8 5.3 6.3s-2.9 6.3-6.1 6.3c-1.6 0-3.2-.4-4.6-1.3V0h1.4zm0 9.1c1 .5 2.1.8 3.2.8 2.5 0 4.8-1.5 4.8-5.1 0-3.2-1.8-5.1-4.1-5.1-1.5.1-2.9.8-3.9 1.9zM41.5 19V0h1.3v19zm5.8-4.7c0 2.9 1.4 3.7 2.8 3.7a5 5 0 0 0 4.2-2.7V6.9h1.4v12.2h-1.4v-2.4a5.7 5.7 0 0 1-4.6 2.5c-1.9 0-3.8-1.1-3.8-4.8V6.9h1.4zm21.4 3.9a8 8 0 0 1-4.3 1c-4.1-.1-6.2-3.4-6.1-6.8 0-3.2 2.5-5.8 5.6-5.8h.4c3.3.1 5.5 2.7 5.1 6.6h-9.8c0 2.6 2.1 4.7 4.7 4.8h.1c1.3 0 2.6-.3 3.8-.9zm-.5-6.1a4 4 0 0 0-3.8-4.2h-.2a4.4 4.4 0 0 0-4.5 4.2zm5.6-2.9c1-1.6 2.6-2.5 4.5-2.6 2.4 0 3.9 1.8 3.9 4.6V19h-1.3v-7.6c0-2.6-1.4-3.6-2.8-3.6a5.6 5.6 0 0 0-4.2 2.7V19h-1.3V0H74c-.2 0-.2 9.2-.2 9.2zm22.3 3.7c0 4-2.7 6.3-5.9 6.3-3.5 0-5.9-2.8-5.9-6.3a6 6 0 0 1 5.6-6.3h.3c3.2.1 5.9 2.4 5.9 6.3zm-10.3 0c0 2.7 1.6 5 4.5 5s4.5-2.4 4.5-5-1.7-5-4.5-5-4.5 2.3-4.5 5zm13.4 4c1 .6 2.1 1 3.2 1 1.3 0 2.9-.5 2.8-1.8 0-1.1-1.2-2-3-2.7-2.1-.8-3.9-1.6-3.9-3.5s1.8-3.3 4.2-3.3a7 7 0 0 1 3.4.9l-.5 1.1c-.9-.5-1.8-.7-2.8-.7-2 0-2.9 1-2.9 2 0 1.3 1.5 1.8 3.4 2.6 2.9 1.1 3.6 2.5 3.6 3.6 0 1.9-1.8 3.1-4.2 3.1-1.4 0-2.7-.4-3.9-1.1zm16.4-10V8h-4v6.7c0 2 .8 3.2 2.6 3.3.8 0 1.6-.1 2.3-.5l.4 1.2c-.9.3-1.8.5-2.7.5-2.2 0-3.9-1.3-3.9-4.5V8H108V6.9h2.2V2.8h1.4v4.1z"/></svg>';
// need to base64 to keep the fill color intact
$logo_b64 = base64_encode( $logo_svg );
// reused class collections for easy edits
$box_li_classes = 'nfd-widget-account-box-li max-[575px]:nfd-items-start nfd-flex nfd-items-center nfd-justify-center nfd-card nfd-bg-canvas';
$box_a_classes = 'nfd-widget-account-box-a nfd-flex nfd-flex-col nfd-gap-1 nfd-items-center nfd-text-center nfd-text-[#404040] hover:nfd-text-primary';
?>
<style>
	#bluehost_account_widget h2 {
		justify-content: start;
		gap: .5rem;
		font-size: 0; /* hides  text */
	}
	#bluehost_account_widget h2:before {
		content: url('data:image/svg+xml;base64,<?php echo $logo_b64 ?>');
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
				href="<?php
					echo esc_url (
						isJarvis() ?
							addUtmParams( getPlatformPathUrl ( 'account-center' ) ) :
							addUtmParams( getPlatformBaseUrl ( '/cgi/token' ) )
					);
				?>"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
				</svg>
				<?php _e( 'Profile', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="<?php
					echo esc_url ( 
						addUtmParams ( 
							getPlatformPathUrl (
								'home',
								'app#/email-office'
							)
						)
					); 
				?>"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
				</svg>
				<?php _e( 'Mail', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a 
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="<?php
				echo esc_url (
					addUtmParams (
						getPlatformPathUrl (
							'hosting/list', 
							'app'
						)
					)
					);
				?>"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
				</svg>
				<?php _e( 'Hosting', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li class="<?php echo esc_attr( $box_li_classes ); ?>">
			<a 
				class="<?php echo esc_attr( $box_a_classes ); ?>"
				target="_blank"
				href="<?php
					echo esc_url ( 
						addUtmParams ( 
							getPlatformPathUrl ( 
								'account-center', 
								'account_center#security'
							)
						)
					);
				?>"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
				</svg>
				<?php _e( 'Security', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
	</ul>
	<p class="nfd-mt-4"><strong><?php _e( 'Quick Access', 'wp-plugin-bluehost' ); ?></strong></p>
	<ul class="nfd-mt-4">
		<li>
			<a
				target="_blank"
				href="<?php 
					echo esc_url ( 
						addUtmParams ( 
							getPlatformPathUrl ( 
								'billing-center',
								'account_center#billing'
							)
						)
					);
				?>"
			>
				<?php _e( 'Payment Methods', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
		<li>
			<a 
				target="_blank"
				href="<?php 
					echo esc_url ( 
						addUtmParams ( 
							getPlatformPathUrl ( 
								'renewal-center',
								'account_center#products'
							)
						)
					);
				?>"
			>
				<?php _e( 'Renewals Center', 'wp-plugin-bluehost' ); ?>
			</a>
		</li>
	</ul>
</div>