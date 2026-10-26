<?php

namespace Bluehost\DomainConnect;

use NewfoldLabs\WP\Module\AIChat\Helpers\HiiveHelper;
use NewfoldLabs\WP\Module\AIChat\Helpers\JarvisJWTHelper;
use NewfoldLabs\WP\Module\Data\HiiveConnection;
use WP_Error;

/**
 * Resolves shopper context for the Bluehost domain-connect MFE.
 */
class Context {

	/**
	 * Customer response reused only within the current context operation.
	 *
	 * @var array|WP_Error|null
	 */
	private $customer = null;

	/**
	 * Build MFE init payload for the current site.
	 *
	 * @return array|WP_Error
	 */
	public function get_init_context() {
		$this->customer = null;

		$jwt = $this->get_user_jwt();
		if ( is_wp_error( $jwt ) ) {
			return $jwt;
		}

		$claims = $this->decode_jwt_payload( $jwt );
		if ( is_wp_error( $claims ) ) {
			return $claims;
		}

		$account_id = $this->parse_urn_id( $claims['sub'] ?? '', 'account' );
		$user_id    = $this->parse_urn_id( $claims['act']['sub'] ?? '', 'user' );

		if ( ! $account_id || ! $user_id ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_claims',
				__( 'Jarvis user token is missing required account or user claims.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$customer = $this->get_hiive_customer();
		if ( is_wp_error( $customer ) ) {
			if ( ! $this->uses_debug_jwt() ) {
				return $customer;
			}
			$customer = array();
		}

		$site_id = isset( $customer['site_id'] ) ? (int) $customer['site_id'] : 0;
		if ( $site_id <= 0 && defined( 'NFD_DOMAIN_CONNECT_DEBUG_SITE_ID' ) ) {
			$site_id = (int) NFD_DOMAIN_CONNECT_DEBUG_SITE_ID;
		}
		if ( $site_id <= 0 ) {
			return new WP_Error(
				'bluehost_domain_connect_site_id',
				__( 'Hosting site id is not available for this site.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$product_instance_id = $this->resolve_product_instance_id( $customer );
		if ( '' === $product_instance_id && defined( 'NFD_DOMAIN_CONNECT_DEBUG_PRODUCT_INSTANCE_ID' ) && is_string( NFD_DOMAIN_CONNECT_DEBUG_PRODUCT_INSTANCE_ID ) ) {
			$product_instance_id = NFD_DOMAIN_CONNECT_DEBUG_PRODUCT_INSTANCE_ID;
		}

		$context = array(
			'suggestedName'     => $this->get_suggested_name(),
			'accountId'         => $account_id,
			'userId'            => $user_id,
			'userJwt'           => $jwt,
			'siteId'            => $site_id,
			'productInstanceId' => $product_instance_id,
		);

		/**
		 * Filter domain-connect MFE init context before it is returned to the editor.
		 *
		 * @param array $context Keys match BhDomainConnect.init().
		 */
		$context = apply_filters( 'newfold/tenweb/filter/domain_connect_context', $context );

		if ( empty( $context['productInstanceId'] ) || ! is_string( $context['productInstanceId'] ) ) {
			return new WP_Error(
				'bluehost_domain_connect_product_instance',
				__( 'Hosting product instance id is not available for this site.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		unset( $context['userId'] );

		return $context;
	}

	/**
	 * @return string|WP_Error
	 */
	private function get_user_jwt() {
		if ( defined( 'NFD_DOMAIN_CONNECT_DEBUG_JWT' ) && '' !== NFD_DOMAIN_CONNECT_DEBUG_JWT ) {
			return NFD_DOMAIN_CONNECT_DEBUG_JWT;
		}

		if ( defined( 'NFD_AI_CHAT_JARVIS_DEBUG_TOKEN' ) && '' !== NFD_AI_CHAT_JARVIS_DEBUG_TOKEN ) {
			return NFD_AI_CHAT_JARVIS_DEBUG_TOKEN;
		}

		/**
		 * Supply a Jarvis user JWT for domain-connect (local tooling only).
		 *
		 * @param string|null $jwt Null to use Hiive.
		 */
		$filtered_jwt = apply_filters( 'newfold/tenweb/filter/domain_connect_user_jwt', null );
		if ( is_string( $filtered_jwt ) && '' !== $filtered_jwt ) {
			return $filtered_jwt;
		}

		if ( ! class_exists( JarvisJWTHelper::class ) ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_unavailable',
				__( 'Jarvis authentication is not available.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$customer = $this->get_hiive_customer();
		if ( is_array( $customer ) && ! empty( $customer['jarvis_jwt'] ) && is_string( $customer['jarvis_jwt'] ) ) {
			return $customer['jarvis_jwt'];
		}

		if ( is_wp_error( $customer ) ) {
			// Do not retry the same customer request through the JWT helper.
			$data          = array( 'status' => 502 );
			$upstream_data = $customer->get_error_data();
			if ( is_array( $upstream_data ) && isset( $upstream_data['status'] )
				&& is_numeric( $upstream_data['status'] )
				&& (int) $upstream_data['status'] >= 400 && (int) $upstream_data['status'] <= 599 ) {
				$data['upstream_status'] = (int) $upstream_data['status'];
			}
			return $this->jwt_error(
				__( 'Hosting services could not provide the authentication context. Please try again.', 'wp-plugin-bluehost' ),
				$data
			);
		}

		// Keep compatibility with a valid AI Chat cache without fetching Hiive again.
		$token  = get_transient( JarvisJWTHelper::TRANSIENT_KEY_JWT );
		$claims = $this->decode_jwt_payload( $token );
		if ( ! is_wp_error( $claims ) && isset( $claims['exp'] ) && is_numeric( $claims['exp'] )
			&& (int) $claims['exp'] - time() > JarvisJWTHelper::MIN_SECONDS_UNTIL_EXPIRY ) {
			return $token;
		}

		return $this->jwt_error(
			__( 'The hosting customer response did not include an authentication token.', 'wp-plugin-bluehost' ),
			array( 'status' => 500 )
		);
	}

	/**
	 * Create an authentication error without forwarding upstream response content.
	 *
	 * @param string $message Safe user-facing message.
	 * @param array  $data    Safe status metadata.
	 * @return WP_Error
	 */
	private function jwt_error( $message, array $data ) {
		if ( $this->is_local_environment() ) {
			$message .= ' ' . __(
				'On local sites, define NFD_DOMAIN_CONNECT_DEBUG_JWT in wp-config or wp-content/mu-plugins/local/bh-domain-connect-secrets.php (see bh-domain-connect-secrets.php.example).',
				'wp-plugin-bluehost'
			);
		}

		return new WP_Error( 'jarvis_jwt_fetch_failed', $message, $data );
	}

	/**
	 * Whether a debug Jarvis token constant is in use.
	 *
	 * @return bool
	 */
	private function uses_debug_jwt() {
		return ( defined( 'NFD_DOMAIN_CONNECT_DEBUG_JWT' ) && '' !== NFD_DOMAIN_CONNECT_DEBUG_JWT )
			|| ( defined( 'NFD_AI_CHAT_JARVIS_DEBUG_TOKEN' ) && '' !== NFD_AI_CHAT_JARVIS_DEBUG_TOKEN );
	}

	/**
	 * @return bool
	 */
	private function is_local_environment() {
		return defined( 'WP_ENVIRONMENT_TYPE' ) && 'local' === WP_ENVIRONMENT_TYPE;
	}

	/**
	 * @return array|WP_Error
	 */
	private function get_hiive_customer() {
		if ( null !== $this->customer ) {
			return $this->customer;
		}

		if ( ! HiiveConnection::is_connected() || ! class_exists( HiiveHelper::class ) ) {
			$this->customer = new WP_Error(
				'bluehost_domain_connect_hiive',
				__( 'This site is not connected to Bluehost hosting services.', 'wp-plugin-bluehost' ),
				array( 'status' => 503 )
			);
			return $this->customer;
		}

		$hiive    = new HiiveHelper( '/sites/v1/customer', array(), 'GET' );
		$response = $hiive->send_request();

		if ( is_wp_error( $response ) ) {
			$this->customer = $response;
			return $this->customer;
		}

		if ( ! is_array( $response ) ) {
			$this->customer = new WP_Error(
				'bluehost_domain_connect_hiive',
				__( 'Unexpected hosting customer response.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
			return $this->customer;
		}

		$this->customer = $response;
		return $this->customer;
	}

	/**
	 * @param array $customer Hiive customer payload.
	 * @return string
	 */
	private function resolve_product_instance_id( array $customer ) {
		$candidates = array(
			'product_instance_id',
			'productInstanceId',
			'hosting_product_instance_id',
			'plan_instance_id',
		);

		foreach ( $candidates as $key ) {
			if ( ! empty( $customer[ $key ] ) && is_string( $customer[ $key ] ) ) {
				return $customer[ $key ];
			}
		}

		if ( ! empty( $customer['product_instances'] ) && is_array( $customer['product_instances'] ) ) {
			$first = reset( $customer['product_instances'] );
			if ( is_string( $first ) && '' !== $first ) {
				return $first;
			}
			if ( is_array( $first ) && ! empty( $first['id'] ) ) {
				return (string) $first['id'];
			}
		}

		// Hiive exposes the Jarvis hosting product instance as customer_id.
		// Preserve explicit product fields above and reject legacy customer IDs.
		if ( isset( $customer['customer_id'] ) && is_string( $customer['customer_id'] )
			&& preg_match( '/\AWN\.HP\.[0-9]+\z/', $customer['customer_id'] ) ) {
			return $customer['customer_id'];
		}

		return '';
	}

	/**
	 * @return string
	 */
	private function get_suggested_name() {
		$seed = sanitize_title( (string) get_bloginfo( 'name' ) );
		$seed = preg_replace( '/[^a-z0-9-]/', '', strtolower( $seed ) );

		return $seed ? $seed : 'yoursite';
	}

	/**
	 * @param string $urn URN claim value.
	 * @param string $type account|user.
	 * @return int
	 */
	private function parse_urn_id( $urn, $type ) {
		if ( ! is_string( $urn ) || '' === $urn ) {
			return 0;
		}
		$pattern = '#urn:jarvis:bluehost:' . preg_quote( $type, '#' ) . ':(\d+)#i';
		if ( preg_match( $pattern, $urn, $matches ) ) {
			return (int) $matches[1];
		}
		return 0;
	}

	/**
	 * @param string $token JWT.
	 * @return array|WP_Error
	 */
	private function decode_jwt_payload( $token ) {
		if ( ! is_string( $token ) || '' === $token ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_invalid',
				__( 'Invalid Jarvis user token.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$parts = explode( '.', $token );
		if ( count( $parts ) < 2 ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_invalid',
				__( 'Invalid Jarvis user token.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$payload_b64 = $parts[1];
		$payload_b64 = str_replace( array( '-', '_' ), array( '+', '/' ), $payload_b64 );
		$pad         = strlen( $payload_b64 ) % 4;
		if ( $pad ) {
			$payload_b64 .= str_repeat( '=', 4 - $pad );
		}

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- JWT payload decode.
		$payload_json = base64_decode( $payload_b64, true );
		if ( false === $payload_json ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_invalid',
				__( 'Invalid Jarvis user token.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$payload = json_decode( $payload_json, true );
		if ( ! is_array( $payload ) ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_invalid',
				__( 'Invalid Jarvis user token.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		if ( empty( $payload['iss'] ) || 'jarvis-jwt' !== $payload['iss'] ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_invalid',
				__( 'Jarvis user token has an unexpected issuer.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		return $payload;
	}
}
