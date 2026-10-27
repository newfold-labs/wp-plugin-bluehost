<?php
/** Standalone Domain Connect regression checks; run with php tests/php/domain-connect-context.php. No WordPress, HTTP or credentials. */
namespace NewfoldLabs\WP\Module\Data {
	class HiiveConnection {
		public static $connected = true;
		public static function is_connected() { return self::$connected; }
	}
}
namespace NewfoldLabs\WP\Module\AIChat\Helpers {
	class HiiveHelper {
		public static $customer = array();
		public static $calls = 0;
		public function __construct( $endpoint, $body, $method ) {}
		public function send_request() { ++self::$calls; return self::$customer; }
	}
	class JarvisJWTHelper {
		const TRANSIENT_KEY_JWT = 'nfd_ai_chat_jarvis_jwt';
		const MIN_SECONDS_UNTIL_EXPIRY = 360;
		public function get_token() { throw new \RuntimeException( 'Unexpected JWT fallback' ); }
	}
}
namespace {
	class WP_Error {
		private $code;
		private $message;
		private $data;
		public function __construct( $code, $message, $data = null ) { $this->code = $code; $this->message = $message; $this->data = $data; }
		public function get_error_code() { return $this->code; }
		public function get_error_message() { return $this->message; }
		public function get_error_data() { return $this->data; }
	}
	function is_wp_error( $value ) { return $value instanceof WP_Error; }
	function apply_filters( $name, $value ) { return 'newfold/tenweb/filter/domain_connect_user_jwt' === $name && isset( $GLOBALS['filtered_jwt'] ) ? $GLOBALS['filtered_jwt'] : $value; }
	function __( $value, $domain ) { return $value; }
	function get_bloginfo( $key ) { return 'Offline Test Site'; }
	function sanitize_title( $value ) { return strtolower( str_replace( ' ', '-', $value ) ); }
	function wp_remote_request() { throw new RuntimeException( 'Real HTTP forbidden' ); }
	function get_transient( $key ) {
		if ( 'nfd_ai_chat_jarvis_jwt' !== $key ) { throw new RuntimeException( 'Unexpected cache key' ); }
		return $GLOBALS['cached_jwt'] ?? false;
	}
	function set_transient() { throw new RuntimeException( 'Cache writes forbidden' ); }
	function delete_transient() { throw new RuntimeException( 'Cache writes forbidden' ); }
	function update_option() { throw new RuntimeException( 'WordPress writes forbidden' ); }
	require dirname( __DIR__, 2 ) . '/inc/DomainConnect/Context.php';
	use Bluehost\DomainConnect\Context;
	use NewfoldLabs\WP\Module\AIChat\Helpers\HiiveHelper;
	$context = new Context();
	$method = new ReflectionMethod( Context::class, 'resolve_product_instance_id' );
	if ( PHP_VERSION_ID < 80100 ) {
		$method->setAccessible( true );
	}
	$cases = array(
		'Jarvis hosting reference' => array( array( 'customer_id' => 'WN.HP.123' ), 'WN.HP.123' ),
		'ID remains string beyond integer range' => array( array( 'customer_id' => 'WN.HP.123456789012345678901234567890' ), 'WN.HP.123456789012345678901234567890' ),
		'explicit snake alias first' => array( array( 'product_instance_id' => 'explicit-product', 'customer_id' => 'WN.HP.123' ), 'explicit-product' ),
		'explicit camel alias first' => array( array( 'productInstanceId' => 'explicit-product', 'customer_id' => 'WN.HP.123' ), 'explicit-product' ),
		'explicit hosting alias first' => array( array( 'hosting_product_instance_id' => 'explicit-product', 'customer_id' => 'WN.HP.123' ), 'explicit-product' ),
		'explicit plan alias first' => array( array( 'plan_instance_id' => 'explicit-product', 'customer_id' => 'WN.HP.123' ), 'explicit-product' ),
		'alias priority unchanged' => array( array( 'product_instance_id' => 'first-product', 'productInstanceId' => 'second-product', 'customer_id' => 'WN.HP.123' ), 'first-product' ),
		'string list first' => array( array( 'product_instances' => array( 'list-product' ), 'customer_id' => 'WN.HP.123' ), 'list-product' ),
		'object list first' => array( array( 'product_instances' => array( array( 'id' => 'list-product' ) ), 'customer_id' => 'WN.HP.123' ), 'list-product' ),
		'empty alias allows fallback' => array( array( 'product_instance_id' => '', 'product_instances' => array(), 'customer_id' => 'WN.HP.123' ), 'WN.HP.123' ),
		'empty customer rejected' => array( array(), '' ),
		'legacy numeric string rejected' => array( array( 'customer_id' => '1234567' ), '' ),
		'legacy integer rejected' => array( array( 'customer_id' => 1234567 ), '' ),
		'Hiive UUID rejected' => array( array( 'customer_id' => '7950a730-1111-2222-3333-444444444444' ), '' ),
		'nonhosting Jarvis product rejected' => array( array( 'customer_id' => 'WN.DOM.123' ), '' ),
		'lowercase prefix rejected' => array( array( 'customer_id' => 'wn.hp.123' ), '' ),
		'leading whitespace rejected' => array( array( 'customer_id' => ' WN.HP.123' ), '' ),
		'trailing newline rejected' => array( array( 'customer_id' => "WN.HP.123\n" ), '' ),
		'empty suffix rejected' => array( array( 'customer_id' => 'WN.HP.' ), '' ),
		'nonnumeric suffix rejected' => array( array( 'customer_id' => 'WN.HP.ABC' ), '' ),
		'embedded prefix rejected' => array( array( 'customer_id' => 'other-WN.HP.123' ), '' ),
		'array value rejected' => array( array( 'customer_id' => array( 'WN.HP.123' ) ), '' ),
		'null value rejected' => array( array( 'customer_id' => null ), '' ),
		'empty string rejected' => array( array( 'customer_id' => '' ), '' ),
	);
	foreach ( $cases as $name => $case ) {
		if ( $case[1] !== $method->invoke( $context, $case[0] ) ) {
			throw new RuntimeException( $name );
		}
	}

	// Full context regression: the customer API exposes only customer_id, not aliases.
	// Synthetic offline token; never sent to any service and not printed.
	$payload = array( 'iss' => 'jarvis-jwt', 'sub' => 'urn:jarvis:bluehost:account:123', 'act' => array( 'sub' => 'urn:jarvis:bluehost:user:456' ) );
	$jwt = 'offline.' . rtrim( strtr( base64_encode( json_encode( $payload ) ), '+/', '-_' ), '=' ) . '.offline';
	HiiveHelper::$customer = array( 'customer_id' => 'WN.HP.123', 'site_id' => '789', 'jarvis_jwt' => $jwt, 'affiliate' => null, 'provider' => 'brand_name', 'plan_type' => null );
	$result = $context->get_init_context();
	if ( is_wp_error( $result ) || 'WN.HP.123' !== $result['productInstanceId'] || 789 !== $result['siteId'] ) {
		throw new RuntimeException( 'Full context accepts the actual Hiive response shape' );
	}
	HiiveHelper::$customer['customer_id'] = '1234567';
	$result = $context->get_init_context();
	if ( ! is_wp_error( $result ) || 'bluehost_domain_connect_product_instance' !== $result->get_error_code() ) {
		throw new RuntimeException( 'Full context rejects legacy numeric customer IDs' );
	}
	$checks = count( $cases ) + 2;
	function check( $condition, $name ) {
		if ( ! $condition ) { throw new RuntimeException( $name ); }
		++$GLOBALS['checks'];
	}
	function synthetic_token( $expiry, $issuer = 'jarvis-jwt' ) {
		$claims = array( 'iss' => $issuer, 'sub' => 'urn:jarvis:bluehost:account:123', 'act' => array( 'sub' => 'urn:jarvis:bluehost:user:456' ), 'exp' => $expiry );
		return 'offline.' . rtrim( strtr( base64_encode( json_encode( $claims ) ), '+/', '-_' ), '=' ) . '.offline';
	}
	$customer = array( 'customer_id' => 'WN.HP.123', 'site_id' => '789', 'jarvis_jwt' => $jwt );

	HiiveHelper::$calls = 0;
	HiiveHelper::$customer = $customer;
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && 1 === HiiveHelper::$calls, 'One customer request supplies successful context' );
	HiiveHelper::$customer['site_id'] = '790';
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && 790 === $result['siteId'] && 2 === HiiveHelper::$calls, 'Same resolver starts a fresh request on its next operation' );

	$secret = 'PRIVATE_TEST_SENTINEL';
	HiiveHelper::$calls = 0;
	HiiveHelper::$customer = new WP_Error( 'nfd_hiive_error', 'HTTP 504 ' . $secret, array( 'body' => $secret, 'headers' => array( 'Authorization' => $secret ) ) );
	$result = $context->get_init_context();
	check( is_wp_error( $result ) && 'jarvis_jwt_fetch_failed' === $result->get_error_code() && 502 === $result->get_error_data()['status'] && 1 === HiiveHelper::$calls, 'HTTP failure returns502 after one attempt' );
	check( false === strpos( $result->get_error_message() . json_encode( $result->get_error_data() ), $secret ) && ! isset( $result->get_error_data()['upstream_status'] ), 'Upstream text and arbitrary metadata are not forwarded or parsed' );
	HiiveHelper::$customer = $customer;
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && 2 === HiiveHelper::$calls, 'A prior failed operation does not poison a later retry' );

	HiiveHelper::$calls = 0;
	HiiveHelper::$customer = new WP_Error( 'http_request_failed', 'cURL error28 ' . $secret );
	$result = $context->get_init_context();
	check( is_wp_error( $result ) && 502 === $result->get_error_data()['status'] && 1 === HiiveHelper::$calls && false === strpos( $result->get_error_message(), $secret ), 'Transport failure is sanitized and is not retried' );
	HiiveHelper::$customer = new WP_Error( 'nfd_hiive_error', $secret, array( 'status' => 504, 'body' => $secret ) );
	$result = $context->get_init_context();
	check( array( 'status' => 502, 'upstream_status' => 504 ) === $result->get_error_data(), 'Structured upstream HTTP status alone is retained' );
	HiiveHelper::$customer = new WP_Error( 'nfd_hiive_error', $secret, array( 'status' => $secret ) );
	$result = $context->get_init_context();
	check( array( 'status' => 502 ) === $result->get_error_data(), 'Non-numeric status metadata is discarded' );

	HiiveHelper::$calls = 0;
	HiiveHelper::$customer = $customer;
	unset( HiiveHelper::$customer['jarvis_jwt'] );
	$result = $context->get_init_context();
	check( is_wp_error( $result ) && 500 === $result->get_error_data()['status'] && 1 === HiiveHelper::$calls && false !== strpos( $result->get_error_message(), 'did not include' ), 'Missing JWT is distinguished from HTTP failure and is not retried' );
	$GLOBALS['cached_jwt'] = synthetic_token( time() + 7200 );
	HiiveHelper::$calls = 0;
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && $GLOBALS['cached_jwt'] === $result['userJwt'] && 1 === HiiveHelper::$calls, 'Valid helper cache remains usable for successful customer response without JWT' );
	foreach ( array( 'expired' => synthetic_token( time() - 60 ), 'refresh window' => synthetic_token( time() + 60 ), 'invalid issuer' => synthetic_token( time() + 7200, 'unexpected' ), 'invalid token' => 'bad-token', 'non-string' => array( $secret ) ) as $name => $cached ) {
		$GLOBALS['cached_jwt'] = $cached;
		HiiveHelper::$calls = 0;
		$result = $context->get_init_context();
		check( is_wp_error( $result ) && 1 === HiiveHelper::$calls, 'Reject unusable cache: ' . $name );
	}
	$GLOBALS['cached_jwt'] = synthetic_token( time() + 7200 );
	HiiveHelper::$customer = new WP_Error( 'nfd_hiive_error', $secret );
	HiiveHelper::$calls = 0;
	$result = $context->get_init_context();
	check( is_wp_error( $result ) && 502 === $result->get_error_data()['status'] && 1 === HiiveHelper::$calls, 'Cached JWT does not hide unavailable hosting IDs' );

	HiiveHelper::$customer = $customer;
	$GLOBALS['filtered_jwt'] = synthetic_token( time() + 7200 );
	HiiveHelper::$calls = 0;
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && $GLOBALS['filtered_jwt'] === $result['userJwt'] && 1 === HiiveHelper::$calls, 'Existing JWT override filter remains supported' );
	unset( $GLOBALS['filtered_jwt'], $GLOBALS['cached_jwt'] );

	HiiveHelper::$customer = '<html>' . $secret . '</html>';
	HiiveHelper::$calls = 0;
	$result = $context->get_init_context();
	check( is_wp_error( $result ) && 502 === $result->get_error_data()['status'] && 1 === HiiveHelper::$calls && false === strpos( $result->get_error_message(), $secret ), 'Non-array customer response is sanitized and is not retried' );

	// A debug token may still use explicitly configured IDs while Hiive is unavailable.
	define( 'NFD_DOMAIN_CONNECT_DEBUG_JWT', $jwt );
	define( 'NFD_DOMAIN_CONNECT_DEBUG_SITE_ID', 791 );
	define( 'NFD_DOMAIN_CONNECT_DEBUG_PRODUCT_INSTANCE_ID', 'WN.HP.124' );
	HiiveHelper::$customer = new WP_Error( 'nfd_hiive_error', $secret );
	HiiveHelper::$calls = 0;
	$result = $context->get_init_context();
	check( ! is_wp_error( $result ) && 791 === $result['siteId'] && 'WN.HP.124' === $result['productInstanceId'] && 1 === HiiveHelper::$calls, 'Debug JWT and hosting-ID constants remain supported' );

	echo 'PASS: ' . $checks . " checks; plugin Context, offline stubs, no HTTP or writes.\n";
}
