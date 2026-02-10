<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost dashboard widgets (Account, Help, SitePreview).
 *
 * @covers \Bluehost\BluehostAccountWidget
 * @covers \Bluehost\BluehostHelpWidget
 * @covers \Bluehost\BluehostSitePreviewWidget
 */
class WidgetsWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/Data.php' );
		require_once codecept_root_dir( 'inc/widgets/Account.php' );
		require_once codecept_root_dir( 'inc/widgets/Help.php' );
		require_once codecept_root_dir( 'inc/widgets/SitePreview.php' );
	}

	public function test_bluehost_account_widget_has_expected_id(): void {
		$this->assertSame( 'bluehost_account_widget', \Bluehost\BluehostAccountWidget::ID );
	}

	public function test_bluehost_help_widget_has_expected_id(): void {
		$this->assertSame( 'bluehost_help_widget', \Bluehost\BluehostHelpWidget::ID );
	}

	public function test_bluehost_site_preview_widget_has_expected_id(): void {
		$this->assertSame( 'site_preview_widget', \Bluehost\BluehostSitePreviewWidget::ID );
	}
}
