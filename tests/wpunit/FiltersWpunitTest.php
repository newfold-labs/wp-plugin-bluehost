<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\Filters (Hiive headers, etc.).
 *
 * @coversDefaultClass \Bluehost\Filters
 */
class FiltersWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * @var callable|null
	 */
	private $stylesheet_wvc_stub;

	/**
	 * @var callable|null
	 */
	private $template_wvc_stub;

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Filters.php' );
		$this->stylesheet_wvc_stub = null;
		$this->template_wvc_stub   = null;
	}

	protected function tearDown(): void {
		if ( $this->stylesheet_wvc_stub ) {
			\remove_filter( 'stylesheet', $this->stylesheet_wvc_stub, 99 );
			$this->stylesheet_wvc_stub = null;
		}
		if ( $this->template_wvc_stub ) {
			\remove_filter( 'template', $this->template_wvc_stub, 99 );
			$this->template_wvc_stub = null;
		}
		parent::tearDown();
	}

	/**
	 * Stub get_stylesheet()/get_template() to the given slugs (no real theme files required).
	 */
	private function stub_theme_slugs( string $stylesheet, string $template ): void {
		$this->stylesheet_wvc_stub = static function () use ( $stylesheet ) {
			return $stylesheet;
		};
		$this->template_wvc_stub = static function () use ( $template ) {
			return $template;
		};
		\add_filter( 'stylesheet', $this->stylesheet_wvc_stub, 99 );
		\add_filter( 'template', $this->template_wvc_stub, 99 );
	}

	private function stub_wvc_theme_slugs(): void {
		$this->stub_theme_slugs( 'wvc-theme', 'wvc-theme' );
	}

	/** Parent directory is wvc-theme; active stylesheet is a child slug (child theme scenario). */
	private function stub_template_only_wvc(): void {
		$this->stub_theme_slugs( 'wvc-child', 'wvc-theme' );
	}

	/** Both slugs explicitly set to a non-WVC theme so tests don't depend on the WP test default. */
	private function stub_non_wvc_theme_slugs(): void {
		$this->stub_theme_slugs( 'twentytwentyfive', 'twentytwentyfive' );
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_url_not_hiive(): void {
		$args = array(
			'method'  => 'GET',
			'headers' => array( 'Accept' => 'application/json' ),
		);
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://example.com/api' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\Filters::add_hiive_headers */
	public function test_add_hiive_headers_returns_unchanged_when_headers_missing(): void {
		$args = array( 'method' => 'GET' );
		$result = \Bluehost\Filters::add_hiive_headers( $args, 'https://other.org/feed' );
		$this->assertSame( $args, $result );
	}

	/** @covers \Bluehost\Filters::filter_coming_soon_portal_data */
	public function test_filter_coming_soon_portal_data_returns_non_array_unchanged(): void {
		$not_array = new \stdClass();
		$result    = \Bluehost\Filters::filter_coming_soon_portal_data( $not_array );
		$this->assertSame( $not_array, $result );
	}

	/** @covers \Bluehost\Filters::filter_coming_soon_portal_data */
	public function test_filter_coming_soon_portal_data_leaves_array_when_not_wvc_theme(): void {
		$this->stub_non_wvc_theme_slugs();
		$input = array(
			'isComingSoon' => true,
			'editUrl'      => 'https://example.test/wp-admin/customize.php',
			'viewUrl'      => 'https://example.test',
			'previewUrl'   => 'https://example.test/?preview=coming_soon',
		);
		$result = \Bluehost\Filters::filter_coming_soon_portal_data( $input );
		$this->assertSame( $input, $result );
	}

	/** @covers \Bluehost\Filters::filter_coming_soon_portal_data */
	public function test_filter_coming_soon_portal_data_sets_wvc_editor_when_wvc_theme(): void {
		$this->stub_wvc_theme_slugs();
		$input = array(
			'isComingSoon' => true,
			'editUrl'      => 'https://example.test/wp-admin/site-editor.php',
			'viewUrl'      => 'https://example.test',
			'previewUrl'   => 'https://example.test/?preview=coming_soon',
		);
		$result = \Bluehost\Filters::filter_coming_soon_portal_data( $input );
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'editUrl', $result );
		$this->assertStringStartsWith( \admin_url(), $result['editUrl'] );
		$this->assertStringContainsString( 'admin.php?page=wvc-editor', $result['editUrl'] );
		$this->assertSame( $input['isComingSoon'], $result['isComingSoon'] );
		$this->assertSame( $input['viewUrl'], $result['viewUrl'] );
		$this->assertSame( $input['previewUrl'], $result['previewUrl'] );
	}

	/** @covers \Bluehost\Filters::get_site_edit_admin_url */
	public function test_get_site_edit_admin_url_points_to_wvc_editor_when_wvc_theme(): void {
		$this->stub_wvc_theme_slugs();
		$url = \Bluehost\Filters::get_site_edit_admin_url();
		$this->assertStringStartsWith( \admin_url(), $url );
		$this->assertStringContainsString( 'admin.php?page=wvc-editor', $url );
	}

	/** @covers \Bluehost\Filters::get_site_edit_admin_url */
	public function test_get_site_edit_admin_url_wvc_when_only_template_slug_is_wvc(): void {
		$this->stub_template_only_wvc();
		$url = \Bluehost\Filters::get_site_edit_admin_url();
		$this->assertStringContainsString( 'admin.php?page=wvc-editor', $url );
	}

	/** @covers \Bluehost\Filters::get_site_edit_admin_url */
	public function test_get_site_edit_admin_url_uses_site_editor_or_customizer_when_not_wvc(): void {
		$this->stub_non_wvc_theme_slugs();
		$url      = \Bluehost\Filters::get_site_edit_admin_url();
		$expected = \wp_is_block_theme() ? 'site-editor.php?canvas=edit' : 'customize.php';
		$this->assertSame( \admin_url( $expected ), $url );
	}

	/** @covers \Bluehost\Filters::init */
	public function test_init_registers_portal_data_filter(): void {
		\Bluehost\Filters::init();

		$callback = array( \Bluehost\Filters::class, 'filter_coming_soon_portal_data' );

		$this->assertNotFalse(
			\has_filter( 'newfold/coming-soon/filter/portal_data', $callback )
		);

		\remove_filter( 'newfold/coming-soon/filter/portal_data', $callback );
		\remove_filter( 'http_request_args', array( \Bluehost\Filters::class, 'add_hiive_headers' ), 99 );
	}
}
