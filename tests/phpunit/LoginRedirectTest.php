<?php
/**
 * Tests for Bluehost\LoginRedirect.
 *
 * @package WPPluginBluehost
 */

/**
 * Class LoginRedirectTest
 */
class LoginRedirectTest extends WP_UnitTestCase {

	/**
	 * Load LoginRedirect (registers hooks; we only test static methods).
	 */
	public static function set_up_before_class() {
		parent::set_up_before_class();
		require_once dirname( dirname( __DIR__ ) ) . '/inc/LoginRedirect.php';
	}

	/**
	 * is_user returns false for null.
	 */
	public function test_is_user_returns_false_for_null() {
		$this->assertFalse( \Bluehost\LoginRedirect::is_user( null ) );
	}

	/**
	 * is_user returns false for non-object.
	 */
	public function test_is_user_returns_false_for_non_object() {
		$this->assertFalse( \Bluehost\LoginRedirect::is_user( 'not-a-user' ) );
	}

	/**
	 * is_user returns true for WP_User.
	 */
	public function test_is_user_returns_true_for_wp_user() {
		$user = self::factory()->user->create_and_get();
		$this->assertTrue( \Bluehost\LoginRedirect::is_user( $user ) );
	}

	/**
	 * is_administrator returns true for user with manage_options.
	 */
	public function test_is_administrator_returns_true_for_admin() {
		$user = self::factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$this->assertTrue( \Bluehost\LoginRedirect::is_administrator( $user ) );
	}

	/**
	 * is_administrator returns false for subscriber.
	 */
	public function test_is_administrator_returns_false_for_subscriber() {
		$user = self::factory()->user->create_and_get( array( 'role' => 'subscriber' ) );
		$this->assertFalse( \Bluehost\LoginRedirect::is_administrator( $user ) );
	}

	/**
	 * is_bluehost_redirect returns true when URL contains bluehost admin page.
	 */
	public function test_is_bluehost_redirect_returns_true_for_bluehost_page() {
		$redirect = admin_url( 'admin.php?page=bluehost' );
		$this->assertTrue( \Bluehost\LoginRedirect::is_bluehost_redirect( $redirect ) );
	}

	/**
	 * is_bluehost_redirect returns false for other URL.
	 */
	public function test_is_bluehost_redirect_returns_false_for_other_url() {
		$this->assertFalse( \Bluehost\LoginRedirect::is_bluehost_redirect( admin_url( 'index.php' ) ) );
	}

	/**
	 * get_bluehost_dashboard_url returns admin URL with page=bluehost and hash.
	 */
	public function test_get_bluehost_dashboard_url() {
		$url = \Bluehost\LoginRedirect::get_bluehost_dashboard_url();
		$this->assertStringContainsString( 'admin.php', $url );
		$this->assertStringContainsString( 'page=bluehost', $url );
		$this->assertStringContainsString( '#/home', $url );
	}
}
