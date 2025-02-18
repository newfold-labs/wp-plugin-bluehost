<?php
/**
 * Site Preview Widget View
 *
 * This is rendered on the WordPress dashboard Site Preview widget.
 * Icon svgs from HeroIcons https://heroicons.com/
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

use function NewfoldLabs\WP\Module\ComingSoon\isComingSoonActive;

$isComingSoon = isComingSoonActive();

// globe-alt icon
$svg    = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
</svg>';
$svg_64 = base64_encode( $svg );
// check-circle
$svgEnabled = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>';
// exclamation-circle
$svgDisabled = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
</svg>';

?>
<style>
	#site_preview_widget h2 {
		justify-content: start;
		gap: .5rem;
	}
	#site_preview_widget h2:before {
		content: url('data:image/svg+xml;base64,<?php echo esc_attr( $svg_64 ); ?>');
		width: 24px;
		height: 24px;
	}
	#iframe-preview-wrap {
		position: relative;
		overflow: hidden;
		padding-top: 60%;
		border: 1px solid #dbd1d1;
		border-radius: 0.375rem;
	}
	#iframe-preview-label {
		width: 100%;
		position: absolute;
		top: 0;
		text-transform: uppercase;
	}
	#iframe-preview-detail {
		width: 100%;
		position: absolute;
		bottom: 0;
	}
	#iframe-wrap {
		position: relative;
	}
	#iframe-preview {
		width: 400%;
		height: 400%;
		transform: scale(0.25);
		transform-origin: top left;
		position: absolute;
		top: 20px; /* offset for label and iframe adminbar */
		left: 0;
		right: 0;
		bottom: 0;
	}
	.iframe-preview-domain {
		font-weight: bold;
	}
	.iframe-preview-status svg {
		width: 1.5rem;
	}
	.iframe-preview-status.status-coming-soon {
		color: rgb(225 0 1);
	}
	.iframe-preview-status.status-live {
		color: rgb(0 129 18);
	}
</style>
<div class="nfd-root nfd-widget nfd-widget-site-preview">
	<div class="nfd-flex nfd-justify-between nfd-items-center nfd-mb-4 nfd-gap-8">
		<?php if ( $isComingSoon ) : ?>
			<span><?php esc_html_e( 'Your site is currently displaying a "Coming Soon" page.', 'wp-plugin-bluehost' ); ?></span>
			<a 
				class="nfd-button nfd-button--primary nfd-shrink-0"
				href="#"
				id="coming-soon-disable"
			><?php esc_html_e( 'Launch Site', 'wp-plugin-bluehost' ); ?></a>
		<?php else : ?>
			<span><?php esc_html_e( 'Your site is live to the world!', 'wp-plugin-bluehost' ); ?></span>
			<a 
				class="nfd-button nfd-button--secondary nfd-shrink-0"
				href="#"
				id="coming-soon-enable"
			><?php esc_html_e( 'Activate Coming Soon', 'wp-plugin-bluehost' ); ?></a>
		<?php endif; ?>
	</div>

	<div id="iframe-preview-wrap">
		<div
			id="iframe-preview-label"
			class="nfd-flex nfd-justify-center nfd-items-center nfd-p-1 nfd-bg-gray-200 nfd-border-b nfd-border-[#dbd1d1] nfd-z-10"
		>
			<p class="nfd-font-bold"><?php esc_html_e( 'Site Preview', 'wp-plugin-bluehost' ); ?></p>
		</div>
		<div class="iframe-wrap">
			<iframe
				id="iframe-preview"
				title="<?php esc_attr_e( 'Site Preview', 'wp-plugin-bluehost' ); ?>"
				className="nfd-basis-full nfd-relative"
				src="<?php echo esc_url( get_bloginfo( 'url' ) . '?preview=coming_soon' ); ?>"
				scrolling="no"
				name="iframe-preview"
				sandbox="allow-scripts allow-same-origin"
				seamless
			></iframe>
		</div>
		<div
			id="iframe-preview-detail"
			class="nfd-flex nfd-justify-between nfd-items-center nfd-p-1 nfd-px-6 nfd-bg-gray-200 nfd-border-t nfd-border-[#dbd1d1] nfd-z-10"
		>
			<span class="iframe-preview-domain nfd-font-semibold">
				<?php
					$parseUrl = wp_parse_url( get_bloginfo( 'url' ) );
					echo esc_html( $parseUrl['host'] );
				?>
			</span>
			<span class="iframe-preview-status nfd-flex nfd-flex-row nfd-items-center nfd-gap-2 nfd-font-semibold
				<?php echo esc_attr( $isComingSoon ? 'status-coming-soon' : 'status-live' ); ?>
			">
				<?php
					echo $isComingSoon ?
					wp_kses( $svgDisabled, KSES_ALLOWED_SVG_TAGS ) :
					wp_kses( $svgEnabled, KSES_ALLOWED_SVG_TAGS );
				?>
				<span>
					<?php
						echo $isComingSoon ?
						esc_html__( 'Not Live', 'wp-plugin-bluehost' ) :
						esc_html__( 'Live', 'wp-plugin-bluehost' );
					?>
				</span>
			</span>
		</div>
	</div>

	<p class="nfd-flex nfd-gap-4 nfd-justify-center nfd-items-center nfd-text-center nfd-mt-4">
		<a 
			href="<?php echo esc_url( get_bloginfo( 'url' ) ); ?>"
			target="_blank"
			class="nfd-button nfd-button--secondary nfd-mb-4"
		><?php esc_html_e( 'View Site', 'wp-plugin-bluehost' ); ?></a>
		<a 
			href="<?php echo esc_url( get_admin_url( null, 'site-editor.php?canvas=edit' ) ); ?>"
			class="nfd-button nfd-button--secondary nfd-mb-4"
		><?php esc_html_e( 'Edit Site', 'wp-plugin-bluehost' ); ?></a>
	</p>
</div>
<script>
// inline script for now
document.addEventListener('DOMContentLoaded', init, false);
function init(){
	const enable_button = document.getElementById('coming-soon-enable');
	if ( enable_button ) {
		enable_button.addEventListener( 'click', function( e ) {
			e.preventDefault();
			if ( e.target.hasAttribute('disabled') ) {
				return;
			}
			e.target.setAttribute('disabled', '');
			window.NewfoldRuntime.comingSoon.enable().then(() => {
				window.location.reload();
			});
		});
	}

	const disable_button = document.getElementById('coming-soon-disable');
	if (disable_button) {
		disable_button.addEventListener( 'click', function( e ) {
			e.preventDefault();
			if ( e.target.hasAttribute('disabled') ) {
				return;
			}
			e.target.setAttribute('disabled', '');
			window.NewfoldRuntime.comingSoon.disable().then(() => {
				window.location.reload();
			});
		});
	}
};
</script>