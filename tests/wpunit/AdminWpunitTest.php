<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Admin (subpages, menu structure).
 *
 * @coversDefaultClass \Bluehost\Admin
 */
class AdminWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Data.php' );
		require_once codecept_root_dir( 'inc/Admin.php' );
	}

	/** @covers \Bluehost\Admin::plugin_subpages */
	public function test_plugin_subpages_returns_array(): void {
		$subpages = \Bluehost\Admin::plugin_subpages();
		$this->assertIsArray( $subpages );
		$this->assertNotEmpty( $subpages );
	}

	/** @covers \Bluehost\Admin::plugin_subpages */
	public function test_plugin_subpages_each_item_has_route_title_priority(): void {
		$subpages = \Bluehost\Admin::plugin_subpages();
		foreach ( $subpages as $item ) {
			$this->assertArrayHasKey( 'route', $item );
			$this->assertArrayHasKey( 'title', $item );
			$this->assertArrayHasKey( 'priority', $item );
		}
	}

	/** @covers \Bluehost\Admin::plugin_subpages */
	public function test_plugin_subpages_includes_home_settings_help(): void {
		$subpages  = \Bluehost\Admin::plugin_subpages();
		$routes    = wp_list_pluck( $subpages, 'route' );
		$this->assertContains( 'bluehost#/home', $routes );
		$this->assertContains( 'bluehost#/settings', $routes );
		$this->assertContains( 'bluehost#/help', $routes );
	}

	/** @covers \Bluehost\Admin::plugin_subpages */
	public function test_plugin_subpages_sorted_by_priority(): void {
		$subpages = \Bluehost\Admin::plugin_subpages();
		$priorities = wp_list_pluck( $subpages, 'priority' );
		$sorted = $priorities;
		sort( $sorted, SORT_NUMERIC );
		$this->assertSame( $sorted, $priorities, 'Subpages should be sorted by priority ascending' );
	}

	/** @covers \Bluehost\Admin::plugin_subpages */
	public function test_plugin_subpages_excludes_performance_and_staging_routes(): void {
		$subpages = \Bluehost\Admin::plugin_subpages();
		$routes   = wp_list_pluck( $subpages, 'route' );
		$this->assertNotContains( 'bluehost#/settings/performance', $routes );
		$this->assertNotContains( 'bluehost#/settings/staging', $routes );
	}
}
