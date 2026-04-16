<?php
/**
 * Lighthouse Report dashboard widget view (React mount point).
 *
 * Title + icon follow the same pattern as {@see \Bluehost\BluehostHelpWidget}:
 * WordPress renders the metabox heading; CSS adds the Lighthouse mark via `h2:before`.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

$icon_path = BLUEHOST_PLUGIN_DIR . '/assets/svg/lighthouse-report-widget-title.svg';
$svg_64    = '';
if ( is_readable( $icon_path ) ) {
	$svg_64 = base64_encode( (string) file_get_contents( $icon_path ) );
}
?>
<?php if ( $svg_64 ) : ?>
<style>
	#bluehost_lighthouse_report_widget h2 {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
	}
	#bluehost_lighthouse_report_widget h2:before {
		content: '';
		display: block;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		background-image: url('data:image/svg+xml;base64,<?php echo esc_attr( $svg_64 ); ?>');
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
	}
</style>
<?php endif; ?>
<div
	id="bluehost_lighthouse_report_widget_root"
	class="nfd-root nfd-widget nfd-widget-lighthouse"
	data-test-id="lighthouse-report-dashboard-widget"
></div>
