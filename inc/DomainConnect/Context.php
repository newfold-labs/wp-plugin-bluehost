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
	 * Build MFE init payload for the current site.
	 *
	 * @return array|WP_Error
	 */
	public function get_init_context() {
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
			return $customer;
		}

		$site_id = isset( $customer['site_id'] ) ? (int) $customer['site_id'] : 0;
		if ( $site_id <= 0 ) {
			return new WP_Error(
				'bluehost_domain_connect_site_id',
				__( 'Hosting site id is not available for this site.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$product_instance_id = $this->resolve_product_instance_id( $customer );

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

		if ( ! class_exists( JarvisJWTHelper::class ) ) {
			return new WP_Error(
				'bluehost_domain_connect_jwt_unavailable',
				__( 'Jarvis authentication is not available.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		$helper = new JarvisJWTHelper();
		$token  = $helper->get_token();

		return is_wp_error( $token ) ? $token : $token;
	}

	/**
	 * @return array|WP_Error
	 */
	private function get_hiive_customer() {
		if ( ! HiiveConnection::is_connected() || ! class_exists( HiiveHelper::class ) ) {
			return new WP_Error(
				'bluehost_domain_connect_hiive',
				__( 'This site is not connected to Bluehost hosting services.', 'wp-plugin-bluehost' ),
				array( 'status' => 503 )
			);
		}

		$hiive    = new HiiveHelper( '/sites/v1/customer', array(), 'GET' );
		$response = $hiive->send_request();

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( ! is_array( $response ) ) {
			return new WP_Error(
				'bluehost_domain_connect_hiive',
				__( 'Unexpected hosting customer response.', 'wp-plugin-bluehost' ),
				array( 'status' => 500 )
			);
		}

		return $response;
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
