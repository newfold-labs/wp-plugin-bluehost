<?php
/**
 * Account Widget View
 * 
 * This is rendered on the WordPress dashboard Bluehost Account widget.
 * Icon svgs from HeroIcons https://heroicons.com/
 */
use function NewfoldLabs\WP\ModuleLoader\container;

 // lifebuoy icon
$svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288" /></svg>';

// check help center capabilities
function canAccessHelpCenter () {
	$capabilities = container()->get( 'capabilities' )->all();
	if ( isset( $capabilities['canAccessHelpCenter'] ) && $capabilities['canAccessHelpCenter'] ) {
		return true;
	}
	return false;
}

?>
<style>
	#bluehost_help_widget h2 {
		justify-content: start;
		gap: .5rem;
	}
	#bluehost_help_widget h2:before {
		content: url('data:image/svg+xml;utf8,<?php echo $svg; ?>');
		width: 24px;
		height: 24px;
	}
	.helpsvg {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: .5rem auto;
		max-width: 80%;
	}
</style>
<div class="nfd-root nfd-widget nfd-widget-help">
	<div class="helpsvg">
		<svg viewBox="0 0 539.47 338.14" xmlns="http://www.w3.org/2000/svg">
			<text fill="#67cce6" font-family="OpenSans-Bold, Open Sans" font-size="21.21" font-weight="700" transform="translate(152.76 80.43)">HELLO</text>
			<path d="m123 23.83c11.5-15.09 31-19.38 49-21.42a382.17 382.17 0 0 1 53.83-2.25c17.27.51 34.79 2.26 50.85 9.13 10.62 4.54 20.45 11.25 31.41 14.71 20.64 6.5 42.6.79 64-1.32a189.17 189.17 0 0 1 52.79 2.24c13.52 2.5 26.94 6.53 38.9 13.78 11.07 6.72 20.63 16 29.18 26.18 10.57 12.55 19.7 26.41 28.79 40.24 7.37 11.21 14.94 22.91 17.18 36.45s-2.5 29.49-14.09 35.14c-6.79 3.31-14.62 2.62-21.87 4.48-14.18 3.64-24.69 16.61-32.08 30.2s-12.73 28.61-21.82 40.89c-18.13 24.61-48 34.73-76.32 41.83-54.53 13.67-114.09 20.38-164.58-5.75-15.83-8.19-30.4-19.46-47.13-25.14-30.58-10.38-64.52-.91-95.28-10.61a84.15 84.15 0 0 1 -33.45-20.23c-10.74-10.52-18.89-23.96-24.31-38.48-14.4-38.34-9-84.64 13.87-117.85s62.19-52.19 100.27-48.29" fill="#68cce5" opacity=".15"/>
			<path d="m153.73 55.81c10.58-15.09 28.51-19.38 45.06-21.41a322.81 322.81 0 0 1 49.62-2.26c15.89.51 32 2.26 46.8 9.13 9.79 4.54 18.79 11.25 28.91 14.73 19 6.5 39.21.79 58.91-1.31a160.49 160.49 0 0 1 48.59 2.23c12.44 2.5 24.79 6.53 35.8 13.79 10.19 6.71 19 16 26.86 26.17 9.73 12.55 18.13 26.41 26.5 40.24 6.79 11.21 13.75 22.91 15.81 36.45s-2.3 29.49-13 35.14c-6.24 3.31-13.46 2.62-20.12 4.48-13.05 3.65-22.73 16.61-29.53 30.2s-11.73 28.59-20.09 40.91c-16.69 24.61-44.17 34.73-70.25 41.83-50.19 13.67-105 20.39-151.49-5.75-14.56-8.19-28-19.46-43.37-25.14-28.15-10.38-59.39-.91-87.71-10.61a76.59 76.59 0 0 1 -30.78-20.23c-9.89-10.52-17.39-24-22.41-38.47-13.23-38.39-8.22-84.69 12.79-117.93s57.28-52.15 92.37-48.26" fill="#68cce5" opacity=".15"/>
			<rect fill="#4687c7" height="143" rx="16.53" transform="matrix(-1 0 0 -1 369.32 236.51)" width="95.39" x="136.96" y="46.76"/>
			<path d="m148.09 116.66v7.6h71.5v-7.6zm71.5 14.26h-71.5v7.6h71.5zm0 14.26h-71.5v7.6h71.5zm0 14.26h-71.5v7.56h71.5zm-36.78 14.26h-34.93v7.6h34.93z" fill="#f8f6f0"/>
			<path d="m54.45 282.58h383.54v11.78h-383.54z" fill="#4687c7"/>
			<path d="m320.07 273.6h-39s20.12-3.08 40.14-6.47c-.71 3.93-1.14 6.47-1.14 6.47z" fill="#a160a7"/>
			<path d="m114.4 270.54v8.46s94 3.06 100.92 0 16.06-27.53 22.94-42.82 15.29-21.41 17.59-9.17 9.94 46.63 9.94 46.63h15.29c3.06 7.65 0 12.24 0 12.24 85.63 8.41 123.09 2.29 123.09-6.88s-31.35-94-42.81-108.57-23.71-22.94-48.17-29.82-29.82-2.29-29.82-2.29-25.23-2.32-46.63 13.68-37.47 87.16-39.77 94-82.57 24.54-82.57 24.54zm206.82-3.41c2.15-11.76 6.88-36 10.32-41.7 4.59-7.64 33.64 30.59 29 33.65-2.16 1.47-20.7 4.92-39.32 8.05z" fill="#004c75"/>
			<path d="m110.51 283.26.77-6.5s-28.61-5-34.57-4.61-4.31 11.11-4.31 11.11z" fill="#67cce6"/>
			<g fill="#fff" stroke="#36434c" stroke-miterlimit="10" stroke-width="2.36">
				<path d="m259.67 270.54c3.82-1.52 21.41 3.06 21.41 3.06s4.58 9.18 0 12.24-9.18-5.36-13-4.59-12.23 8.41-13.76 6.88a2.12 2.12 0 0 1 0-3.06s-2.3 2.29-2.3 0v-2.29s-2.29 2.29-3.05 0 6.88-10.71 10.7-12.24z"/>
				<path d="m95.73 264.79a21.54 21.54 0 0 1 9.39 1.27c3.75 1.35 7.45 2.91 11.07 4.58 1.3 4.4 1.9 9.39-3.71 9.6-4.85.18-7.92-4.59-12.31-5.88-6.15-1.82-14.25-.89-20.64-1.23a11.78 11.78 0 0 1 9.22-7.45c2.63-.37 4.85-.74 6.98-.89z"/>
				<path d="m261.65 106a35.58 35.58 0 0 1 .62-6.65c-.77-3.13-1.15-7 .89-13.84 4.59-15.3 24.46-18.35 37.46-12.24s11.47 34.41 11.47 34.41c-2.48 11.33-7.91 19.06-13.64 23.85l-.12.11v21.91s-9.56 6.88-19.12 0v-17.2l-.81-.51a44.73 44.73 0 0 1 -12.23-12.11 18.78 18.78 0 0 1 -3.38-8.84 34.7 34.7 0 0 1 -1.14-8.89z"/>
			</g>
			<path d="m266.55 48.82c21.41-8.41 30.58 0 40.52 2.3s34.41 9.94 64.22-3.06 67.28-2.29 75.69 9.17 23.71 20.65 39.76 20.65 24.47 13 19.12 31.34-26.76 9.94-39 9.18-28.29 24.46-53.52 19.11-22.17-32.87-45.1-22.17-47.52 29.8-64.36 7.85c6 6 0 0 0 0s.9-12.44 3.19-32.31c0 0-13 1.52-21.41-5.36s-6.11-8.41-14.52-3.06-6.88 4.59-6.88 4.59 0 .25 0 1 0 2.26-.12 4.66c0 1.09-.11 2.36-.2 3.88-.27 4.48 1.53 9.08 4.89 14.13 2.49 3.75-6.67 7.74-2.64 12.11.26.3.54.59.81.89 0 0-1.24 4.59-7.36-6.12s-2.29-22.17-8.41-28.28-6.09-32.09 15.32-40.5z" fill="#67cce6"/>
			<path d="m312 87.82a3.55 3.55 0 0 1 2.75 1.5 6.69 6.69 0 0 1 1.07 3.05 60 60 0 0 1 -.07 12.13 8.5 8.5 0 0 1 -1 3.8c-1.54 2.58-4.39 2.45-7 2.45a9.08 9.08 0 0 1 -1.42-2.29c-1.53-6.12-1.53-12.23.76-17.58a5.33 5.33 0 0 1 4.91-3.06z" fill="#f5f1f3"/>
			<path d="m312 87.82a5.19 5.19 0 0 0 -5 3.06c-2.29 5.35-2.29 11.46-.76 17.58a9.08 9.08 0 0 0 1.42 2.29h-4.46s-3.84-.76-3.84-4.58 0-12.24 1.39-16.06c1.03-2.63 7.53-3.81 11.25-2.29z" fill="#fbb11e"/>
			<path d="m264 88.23a3.49 3.49 0 0 1 .34-.15c0 .83 0 2.26-.12 4.66a12.81 12.81 0 0 1 -.2 3.88c-.27 4.48 1.53 9.08 4.89 14.13h-4.47s-4-.76-4-4.58 0-12.24 1.44-16.06a3.82 3.82 0 0 1 2.12-1.88z" fill="#fbb11e"/>
			<path d="m311.59 96.23c1.23 0 2.22 1.54 2.22 3.44s-1 3.44-2.22 3.44-2.22-1.54-2.22-3.44.99-3.44 2.22-3.44z" fill="#fbb11e"/>
			<path d="m266.46 69.88c4.9-6.25 11.57-10.1 18.92-10.1 15 0 27.24 16.09 27.24 35.94v.51h-2.32c0-.17 0-.34 0-.51 0-18.16-11.16-32.88-24.92-32.88-8.56 0-19.59 5.86-21.89 25.74.33-2.52-1.49-9.17 2.97-18.7z" fill="#f5f1f3"/>
			<path d="m265.39 108a12.63 12.63 0 0 0 15.8 14l.32 1.2a13.24 13.24 0 0 1 -3.5.46 13.84 13.84 0 0 1 -13.86-15.87z" fill="#fbb11e"/>
			<path d="m281.49 120.06c2 .58 3.3 2.14 2.91 3.47s-2.32 1.94-4.32 1.36-3.31-2.14-2.92-3.47 2.33-1.95 4.33-1.36z" fill="#fbb11e"/>
			<path d="m15.53-16.43v16.43h-3.47v-7.09h-6.51v7.09h-3.48v-16.43h3.48v6.44h6.51v-6.44zm13.612 13.55v2.88h-9.46v-16.43h9.46v2.85h-5.98v3.61h5.57v2.85h-5.57v4.24zm13.582 2.88h-10.15v-16.43h3.48v13.55h6.67zm13.004 0h-10.15v-16.43h3.48v13.55h6.67zm17.765-8.24c0 2.72-.674 4.81-2.02 6.27-1.347 1.46-3.28 2.19-5.8 2.19s-4.454-.73-5.8-2.19c-1.347-1.46-2.02-3.557-2.02-6.29s.676-4.823 2.03-6.27c1.353-1.44 3.29-2.16 5.81-2.16 2.526 0 4.46.727 5.8 2.18 1.333 1.453 2 3.543 2 6.27zm-11.99 0c0 1.833.35 3.217 1.05 4.15.693.927 1.733 1.39 3.12 1.39 2.78 0 4.17-1.847 4.17-5.54 0-3.7-1.384-5.55-4.15-5.55-1.387 0-2.43.467-3.13 1.4-.707.933-1.06 2.317-1.06 4.15z" fill="#67cce6" transform="translate(147.690002 82.959999)"/>
			<path d="m15.09 145.9 26.74 13.37 6.93 22.77 3.01-19.29 32.64 14.84 13.37-60.41z" fill="#f5f9fd" stroke="#004c75" stroke-miterlimit="10" stroke-width="1.85"/>
			<path d="m88.29 123.74-42.34 30.82 6.69 1.86z" fill="#67cce6"/>
		</svg>
	</div>
	<p class="nfd-flex nfd-flex-col nfd-gap-4 nfd-items-center nfd-text-center nfd-mt-4">
		<?php _e( 'From DIY to full-service help.', 'wp-plugin-bluehost' ); ?><br /><br />
		<?php _e( 'Call or chat 24/7 for support or let our experts build your site for you.', 'wp-plugin-bluehost' ); ?><br />
		<a 
			<?php 
				echo canAccessHelpCenter() ? 
				'onclick="window.newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp();"' :
				'';
			?>
			href="#/help" 
			class="nfd-button nfd-button--secondary wppbh-help-link nfd-mb-4"    
		><?php _e( 'Get Help', 'wp-plugin-bluehost' ); ?></a>
	</p>
</div>