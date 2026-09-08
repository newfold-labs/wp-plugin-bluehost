<?php
/**
 * PHPUnit tests for Bluehost\base (constants and load; no WP runtime for constants).
 *
 * Functions like bluehost_has_plugin_install_date use get_option and are
 * covered by wpunit BaseFunctionsWpunitTest.
 *
 * @package WPPluginBluehost
 */

use PHPUnit\Framework\TestCase;

class BaseTest extends TestCase {

	/** @var string */
	private static $inc_path;

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		self::$inc_path = dirname( dirname( __DIR__ ) ) . '/inc';
		if ( ! function_exists( 'add_action' ) ) {
			function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {}
		}
		if ( ! function_exists( 'add_filter' ) ) {
			function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {}
		}
		require_once self::$inc_path . '/base.php';
	}

	/** @covers \Bluehost\KSES_ALLOWED_SVG_TAGS */
	public function test_kses_allowed_svg_tags_constant_defined(): void {
		$this->assertTrue( defined( 'Bluehost\KSES_ALLOWED_SVG_TAGS' ) );
		$tags = constant( 'Bluehost\KSES_ALLOWED_SVG_TAGS' );
		$this->assertIsArray( $tags );
	}

	/** @covers \Bluehost\KSES_ALLOWED_SVG_TAGS */
	public function test_kses_allowed_svg_tags_has_expected_keys(): void {
		$tags = constant( 'Bluehost\KSES_ALLOWED_SVG_TAGS' );
		$this->assertArrayHasKey( 'svg', $tags );
		$this->assertArrayHasKey( 'path', $tags );
		$this->assertArrayHasKey( 'g', $tags );
		$this->assertArrayHasKey( 'rect', $tags );
		$this->assertArrayHasKey( 'text', $tags );
	}

	/** @covers \Bluehost\KSES_ALLOWED_SVG_TAGS */
	public function test_kses_allowed_svg_tags_svg_has_expected_attributes(): void {
		$tags = constant( 'Bluehost\KSES_ALLOWED_SVG_TAGS' );
		$this->assertArrayHasKey( 'svg', $tags );
		$svg = $tags['svg'];
		$this->assertIsArray( $svg );
		$this->assertArrayHasKey( 'viewbox', $svg );
		$this->assertArrayHasKey( 'xmlns', $svg );
		$this->assertArrayHasKey( 'width', $svg );
		$this->assertArrayHasKey( 'height', $svg );
	}
}
