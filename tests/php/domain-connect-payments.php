<?php
/** Offline REST contract checks. Payment HTTP must happen in the browser, never PHP. */
namespace Bluehost\DomainConnect {
	class Context {
		public static $result;
		public function get_init_context() { return self::$result; }
	}
}
namespace {
	class WP_REST_Controller {}
	class WP_Error {}
	class PaymentTestResponse {
		public $data;
		public $headers = array();
		public function __construct( $data ) { $this->data = $data; }
		public function header( $name, $value ) { $this->headers[ $name ] = $value; }
	}
	function is_wp_error( $value ) { return $value instanceof WP_Error; }
	function apply_filters( $name, $value ) { return $GLOBALS['qa'] ?? false; }
	function wp_remote_get() { throw new RuntimeException( 'Server-side payment HTTP forbidden' ); }
	function wp_remote_request() { throw new RuntimeException( 'Server-side payment HTTP forbidden' ); }
	function rest_ensure_response( $data ) { return new PaymentTestResponse( $data ); }
	require dirname( __DIR__, 2 ) . '/inc/TenWebDomainConnect.php';
	require dirname( __DIR__, 2 ) . '/inc/DomainConnect/Payments.php';
	require dirname( __DIR__, 2 ) . '/inc/RestApi/DomainConnectController.php';
	$checks = 0;
	function check_payment( $condition, $name ) {
		if ( ! $condition ) { throw new RuntimeException( $name ); }
		++$GLOBALS['checks'];
	}
	$context = array( 'userJwt' => 'synthetic-credential', 'accountId' => 11, 'siteId' => 22, 'productInstanceId' => 'WN.HP.33' );
	\Bluehost\DomainConnect\Context::$result = $context;
	$controller = new \Bluehost\RestApi\DomainConnectController();
	$result = $controller->get_context();
	check_payment( 'https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments' === $result->data['paymentsUrl'], 'Production endpoint' );
	check_payment( ! array_key_exists( 'eligible', $result->data ), 'PHP never claims payment eligibility without a browser check' );
	check_payment( 'no-store' === $result->headers['Cache-Control'], 'No shopper context caching' );
	$actual = $result->data;
	unset( $actual['paymentsUrl'] );
	check_payment( $context === $actual, 'Existing shopper context preserved' );
	$GLOBALS['qa'] = true;
	$result = $controller->get_context();
	check_payment( 'https://sfbff-user-service-bh-qa.apis.newfold.com/api/v1/ms-shopping/get-payments' === $result->data['paymentsUrl'], 'QA endpoint matches MFE' );
	\Bluehost\DomainConnect\Context::$result = new WP_Error();
	check_payment( is_wp_error( $controller->get_context() ), 'Invalid shopper context stays rejected' );
	echo 'PASS: ' . $checks . " payment context checks; server-side payment HTTP forbidden.\n";
}
