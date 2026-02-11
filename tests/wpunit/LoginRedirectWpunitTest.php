<?php

namespace Bluehost;

/**
 * WPUnit tests for Bluehost\LoginRedirect.
 *
 * @coversDefaultClass \Bluehost\LoginRedirect
 */
class LoginRedirectWpunitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected function setUp(): void {
		parent::setUp();
		require_once codecept_root_dir( 'inc/LoginRedirect.php' );
	}

	/** @covers \Bluehost\LoginRedirect::is_user */
	public function test_is_user_returns_false_for_null(): void {
		$this->assertFalse( \Bluehost\LoginRedirect::is_user( null ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_user */
	public function test_is_user_returns_false_for_non_object(): void {
		$this->assertFalse( \Bluehost\LoginRedirect::is_user( 'not-a-user' ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_user */
	public function test_is_user_returns_true_for_wp_user(): void {
		$user = $this->factory()->user->create_and_get();
		$this->assertTrue( \Bluehost\LoginRedirect::is_user( $user ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_administrator */
	public function test_is_administrator_returns_true_for_admin(): void {
		$user = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$this->assertTrue( \Bluehost\LoginRedirect::is_administrator( $user ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_administrator */
	public function test_is_administrator_returns_false_for_subscriber(): void {
		$user = $this->factory()->user->create_and_get( array( 'role' => 'subscriber' ) );
		$this->assertFalse( \Bluehost\LoginRedirect::is_administrator( $user ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_bluehost_redirect */
	public function test_is_bluehost_redirect_returns_true_for_bluehost_page(): void {
		$url = admin_url( 'admin.php?page=bluehost' );
		$this->assertTrue( \Bluehost\LoginRedirect::is_bluehost_redirect( $url ) );
	}

	/** @covers \Bluehost\LoginRedirect::is_bluehost_redirect */
	public function test_is_bluehost_redirect_returns_false_for_other_url(): void {
		$this->assertFalse( \Bluehost\LoginRedirect::is_bluehost_redirect( admin_url( 'index.php' ) ) );
	}

	/** @covers \Bluehost\LoginRedirect::get_bluehost_dashboard_url */
	public function test_get_bluehost_dashboard_url_contains_page_and_hash(): void {
		$url = \Bluehost\LoginRedirect::get_bluehost_dashboard_url();
		$this->assertStringContainsString( 'admin.php', $url );
		$this->assertStringContainsString( 'page=bluehost', $url );
		$this->assertStringContainsString( '#/home', $url );
	}

	/** @covers \Bluehost\LoginRedirect::get_default_redirect_url */
	public function test_get_default_redirect_url_returns_bluehost_dashboard_for_admin(): void {
		$admin = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin->ID );
		$url = \Bluehost\LoginRedirect::get_default_redirect_url( 'https://other.example/redirect' );
		$this->assertStringContainsString( 'page=bluehost', $url );
		$this->assertStringContainsString( '#/home', $url );
	}

	/** @covers \Bluehost\LoginRedirect::get_default_redirect_url */
	public function test_get_default_redirect_url_returns_passed_url_for_non_admin(): void {
		$user = $this->factory()->user->create_and_get( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user->ID );
		$passed = 'https://example.com/custom-redirect';
		$this->assertSame( $passed, \Bluehost\LoginRedirect::get_default_redirect_url( $passed ) );
	}

	/** @covers \Bluehost\LoginRedirect::filter_login_form_defaults */
	public function test_filter_login_form_defaults_sets_redirect_to_bluehost_dashboard(): void {
		$defaults = \Bluehost\LoginRedirect::filter_login_form_defaults( array( 'redirect' => admin_url( '/' ) ) );
		$this->assertArrayHasKey( 'redirect', $defaults );
		$this->assertStringContainsString( 'page=bluehost', $defaults['redirect'] );
		$this->assertStringContainsString( '#/home', $defaults['redirect'] );
	}

	/** @covers \Bluehost\LoginRedirect::on_login_redirect */
	public function test_on_login_redirect_returns_bluehost_dashboard_for_admin_when_empty_requested(): void {
		$admin = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$result = \Bluehost\LoginRedirect::on_login_redirect( admin_url( '/' ), '', $admin );
		$this->assertStringContainsString( 'page=bluehost', $result );
		$this->assertStringContainsString( '#/home', $result );
	}

	/** @covers \Bluehost\LoginRedirect::on_login_redirect */
	public function test_on_login_redirect_returns_wp_admin_for_non_admin_when_bluehost_requested(): void {
		$user = $this->factory()->user->create_and_get( array( 'role' => 'subscriber' ) );
		$bluehost_url = admin_url( 'admin.php?page=bluehost#/home' );
		$result = \Bluehost\LoginRedirect::on_login_redirect( $bluehost_url, $bluehost_url, $user );
		$this->assertSame( admin_url( '/' ), $result );
	}

	/** @covers \Bluehost\LoginRedirect::on_login_redirect */
	public function test_on_login_redirect_returns_original_when_custom_redirect_requested(): void {
		$admin = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$custom = admin_url( 'edit.php?post_type=page' );
		$result = \Bluehost\LoginRedirect::on_login_redirect( $custom, $custom, $admin );
		$this->assertSame( $custom, $result );
	}
}
