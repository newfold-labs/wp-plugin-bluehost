<?php
/**
 * Bootstrap file for unit tests.
 *
 * When WP_PHPUNIT__DIR is set (e.g. in CI) and BLUEHOST_PHPUNIT_MINIMAL is not set,
 * loads the WordPress test suite. Set BLUEHOST_PHPUNIT_MINIMAL=1 to run only the
 * minimal PluginTest without WordPress (e.g. vendor/bin/phpunit tests/phpunit/PluginTest.php).
 *
 * @package WPPluginBluehost
 */

$plugin_root = dirname( dirname( __DIR__ ) );
require $plugin_root . '/vendor/autoload.php';

if ( getenv( 'BLUEHOST_PHPUNIT_MINIMAL' ) ) {
	putenv( 'WP_PHPUNIT__DIR' );
	$wp_phpunit_dir = '';
} else {
	$wp_phpunit_dir = getenv( 'WP_PHPUNIT__DIR' );
}

if ( $wp_phpunit_dir && is_dir( $wp_phpunit_dir ) ) {
	require $wp_phpunit_dir . '/includes/bootstrap.php';
}
