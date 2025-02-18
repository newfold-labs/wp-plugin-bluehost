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
use function NewfoldLabs\WP\Module\ComingSoon\isComingSoonActive;

// globe-alt icon
$svg    = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
</svg>
';
$svg_64 = base64_encode( $svg );
$isComingSoon = isComingSoonActive();

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
        padding-top: 50%;
    }
    #iframe-preview {
        width: 400%;
        height: 400%;
        transform: scale(0.25);
        transform-origin: top left;
        position: absolute;
        top:0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .nfd-align-items-center {
        align-items: center;
    }
</style>
<div class="nfd-root nfd-widget nfd-widget-site-preview">
    <div id="iframe-preview-wrap" class="">
        <iframe
            id="iframe-preview"
            title="<?php _e( 'Site Preview', 'wp-plugin-bluehost' ); ?>"
            className="nfd-basis-full nfd-relative"
            src="<?php echo esc_url( get_bloginfo( 'url' ) . '?preview=coming_soon' ); ?>"
            scrolling="no"
            name="iframe-preview"
            sandbox="allow-scripts allow-same-origin"
            seamless
        ></iframe>
    </div>
    <?php if ( $isComingSoon ) : ?>
        <div class="nfd-flex nfd-justify-between nfd-align-items-center">
            <span>Coming Soon is active. Site is not live.</span>
            <a 
                class="nfd-button nfd-button--primary" 
                href="#"
                id="coming-soon-disable"
            >Launch Site</a>
        </div>
    <?php else : ?>
        <div class="nfd-flex nfd-justify-between nfd-align-items-center">
            <span>Coming Soon is not active. Site is live.</span>
            <a 
                class="nfd-button nfd-button--primary"
                href="#"
                id="coming-soon-enable"
            >Activate Coming Soon</a>
        </div>
    <?php endif; ?>
	<p class="nfd-flex nfd-gap-4 nfd-text-center nfd-justify-center nfd-mt-4">
		<a 
			href="<?php echo esc_url( get_bloginfo( 'url' ) ); ?>"
            target="_blank"
			class="nfd-button nfd-button--secondary wppbh-help-link nfd-mb-4"    
		><?php esc_html_e( 'View Site', 'wp-plugin-bluehost' ); ?></a>
		<a 
			href="<?php echo esc_url( get_admin_url( null, 'site-editor.php?canvas=edit' ) ); ?>"
			class="nfd-button nfd-button--secondary wppbh-help-link nfd-mb-4"    
		><?php esc_html_e( 'Edit Site', 'wp-plugin-bluehost' ); ?></a>
	</p>
</div>
<script>
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