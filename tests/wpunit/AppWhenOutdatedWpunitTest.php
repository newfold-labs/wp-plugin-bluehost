<?php

namespace Bluehost;

/**
 * WPUnit tests for inc/AppWhenOutdated.php (outdated-WordPress app template).
 *
 * The file is a template that outputs HTML when the plugin requires a newer WordPress version.
 *
 * @coversNothing Template output (inc/AppWhenOutdated.php)
 */
class AppWhenOutdatedWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	public function test_app_when_outdated_file_exists(): void {
		$this->assertFileExists( codecept_root_dir( 'inc/AppWhenOutdated.php' ) );
	}

	public function test_app_when_outdated_template_includes_expected_markup(): void {
		global $wp_version;
		$wp_version = '6.0.0';

		ob_start();
		require codecept_root_dir( 'inc/AppWhenOutdated.php' );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'wppbh-app-outdated', $output );
		$this->assertStringContainsString( 'WordPress Update Required', $output );
		$this->assertStringContainsString( 'Minimum required WordPress version', $output );
	}

	public function test_app_when_outdated_template_escapes_plugin_data(): void {
		global $wp_version;
		$wp_version = '6.0.0';

		ob_start();
		require codecept_root_dir( 'inc/AppWhenOutdated.php' );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Update Now', $output );
		$this->assertStringContainsString( admin_url( 'update-core.php' ), $output );
	}
}
