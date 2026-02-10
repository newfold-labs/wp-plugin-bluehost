<?php
/**
 * WPUnit suite bootstrap: define plugin constants so inc/ files can be required without loading the full plugin.
 */
if ( ! defined( 'BLUEHOST_PLUGIN_VERSION' ) ) {
	define( 'BLUEHOST_PLUGIN_VERSION', '4.13.0' );
}
if ( ! defined( 'BLUEHOST_PLUGIN_FILE' ) ) {
	define( 'BLUEHOST_PLUGIN_FILE', codecept_root_dir( 'bluehost-wordpress-plugin.php' ) );
}
if ( ! defined( 'BLUEHOST_PLUGIN_DIR' ) ) {
	define( 'BLUEHOST_PLUGIN_DIR', codecept_root_dir() );
}
if ( ! defined( 'BLUEHOST_PLUGIN_URL' ) ) {
	define( 'BLUEHOST_PLUGIN_URL', 'https://test/' );
}
if ( ! defined( 'BLUEHOST_BUILD_DIR' ) ) {
	define( 'BLUEHOST_BUILD_DIR', BLUEHOST_PLUGIN_DIR . 'build/' . BLUEHOST_PLUGIN_VERSION );
}
if ( ! defined( 'BLUEHOST_BUILD_URL' ) ) {
	define( 'BLUEHOST_BUILD_URL', BLUEHOST_PLUGIN_URL . 'build/' . BLUEHOST_PLUGIN_VERSION );
}
if ( ! defined( 'NFD_HIIVE_URL' ) ) {
	define( 'NFD_HIIVE_URL', 'https://hiive.cloud/api' );
}
