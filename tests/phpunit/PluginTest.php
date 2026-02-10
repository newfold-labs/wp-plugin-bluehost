<?php
/**
 * Minimal PHPUnit sanity tests (no WordPress-dependent assertions).
 *
 * Plugin behaviour and integration are tested in WPUnit (tests/wpunit/).
 * This class extends PHPUnit\Framework\TestCase so it can run without WP_PHPUNIT__DIR.
 *
 * @package WPPluginBluehost
 */

use PHPUnit\Framework\TestCase;

/**
 * Class PluginTest
 */
class PluginTest extends TestCase {

	/**
	 * Plugin main file exists.
	 */
	public function test_plugin_file_exists() {
		$this->assertFileExists( dirname( dirname( __DIR__ ) ) . '/bluehost-wordpress-plugin.php' );
	}

	/**
	 * Plugin version constant is defined in main file (semver-like, e.g. 4.13.0).
	 */
	public function test_plugin_version_constant_defined_in_file() {
		$plugin_file = dirname( dirname( __DIR__ ) ) . '/bluehost-wordpress-plugin.php';
		$content     = file_get_contents( $plugin_file );
		$this->assertNotEmpty( $content );
		$this->assertMatchesRegularExpression(
			'/define\s*\(\s*[\'"]BLUEHOST_PLUGIN_VERSION[\'"]\s*,\s*[\'"]([\d.]+)[\'"]\s*\)/',
			$content,
			'Plugin should define BLUEHOST_PLUGIN_VERSION constant.'
		);
	}
}
