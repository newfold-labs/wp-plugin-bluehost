<?php
/**
 * Widgets bootstrap file
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

require BLUEHOST_PLUGIN_DIR . '/inc/widgets/Account.php';
require BLUEHOST_PLUGIN_DIR . '/inc/widgets/Help.php';
require BLUEHOST_PLUGIN_DIR . '/inc/widgets/SitePreview.php';

/* Start up the Dashboards */
if ( is_admin() ) {
	new BluehostAccountWidget();
	new BluehostHelpWidget();
	new BluehostSitePreviewWidget();
}
