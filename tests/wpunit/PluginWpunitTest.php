<?php

namespace Bluehost;

/**
 * WPUnit tests for plugin environment and constants.
 *
 * Plugin bootstrap and behaviour are tested here; PHPUnit only keeps minimal file/version checks.
 *
 * @coversNothing Plugin environment (constants defined by tests/wpunit/_bootstrap.php)
 */
class PluginWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/** @var string */
	private $plugin_root;

	protected function setUp(): void {
		parent::setUp();
		$this->plugin_root = codecept_root_dir();
	}

	public function test_plugin_constants_defined(): void {
		$this->assertTrue( defined( 'BLUEHOST_PLUGIN_VERSION' ), 'BLUEHOST_PLUGIN_VERSION should be defined' );
		$this->assertTrue( defined( 'BLUEHOST_PLUGIN_FILE' ), 'BLUEHOST_PLUGIN_FILE should be defined' );
		$this->assertTrue( defined( 'BLUEHOST_PLUGIN_DIR' ), 'BLUEHOST_PLUGIN_DIR should be defined' );
		$this->assertTrue( defined( 'BLUEHOST_PLUGIN_URL' ), 'BLUEHOST_PLUGIN_URL should be defined' );
		$this->assertTrue( defined( 'BLUEHOST_BUILD_DIR' ), 'BLUEHOST_BUILD_DIR should be defined' );
		$this->assertTrue( defined( 'BLUEHOST_BUILD_URL' ), 'BLUEHOST_BUILD_URL should be defined' );
	}

	public function test_plugin_main_file_exists(): void {
		$this->assertFileExists( $this->plugin_root . 'bluehost-wordpress-plugin.php' );
	}

	public function test_plugin_version_format(): void {
		$this->assertMatchesRegularExpression(
			'/^\d+\.\d+\.\d+/',
			BLUEHOST_PLUGIN_VERSION,
			'BLUEHOST_PLUGIN_VERSION should be semver-like'
		);
	}
}
