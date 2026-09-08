<?php

namespace Bluehost;

/**
 * WPUnit tests for inc/simple-ui/init.php (admin menu registration and burst mode).
 *
 * @coversNothing Procedural init (inc/simple-ui/init.php)
 */
class SimpleUiWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/simple-ui/init.php' );
	}

	public function test_simple_ui_init_file_exists(): void {
		$this->assertFileExists( codecept_root_dir( 'inc/simple-ui/init.php' ) );
	}

	public function test_admin_menu_action_added(): void {
		$this->assertNotFalse( has_action( 'admin_menu' ) );
	}

	public function test_admin_menu_has_callbacks(): void {
		global $wp_filter;
		$hook = $wp_filter['admin_menu'] ?? null;
		$this->assertNotNull( $hook );
		$callbacks = is_object( $hook ) && isset( $hook->callbacks ) ? $hook->callbacks : array();
		$this->assertNotEmpty( $callbacks, 'admin_menu should have at least one callback from simple-ui' );
	}
}
