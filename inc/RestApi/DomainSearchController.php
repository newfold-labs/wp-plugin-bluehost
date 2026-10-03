<?php

namespace Bluehost\RestApi;

/**
 * Proxies Bluehost domain searches to the SFBFF service.
 */
class DomainSearchController extends \WP_REST_Controller {

	/**
	 * SFBFF domain-search base URL.
	 *
	 * @var string
	 */
	const API_BASE = 'https://sfbff.bluehost.com/api/v1/domain-search';

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'bluehost/v1';

	/**
	 * Register domain-search routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/domains/search',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'search' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'query' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'mode'  => array(
						'default'           => 'search',
						'type'              => 'string',
						'enum'              => array( 'search', 'availability', 'ai', 'aftermarket' ),
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
	}

	/**
	 * Search for domains.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function search( $request ) {
		$query = trim( (string) $request->get_param( 'query' ) );
		$mode  = (string) $request->get_param( 'mode' );

		if ( '' === $query || 200 < strlen( $query ) ) {
			return new \WP_Error(
				'bluehost_invalid_domain_query',
				__( 'Please enter a valid domain search.', 'wp-plugin-bluehost' ),
				array( 'status' => 400 )
			);
		}

		$cache_key = 'bluehost_domain_search_' . md5( $mode . ':' . strtolower( $query ) );
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return new \WP_REST_Response( $cached );
		}

		$response = wp_remote_get(
			$this->build_url( $query, $mode ),
			array(
				'timeout'     => 12,
				'redirection' => 2,
				'headers'     => array( 'Accept' => 'application/json' ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'bluehost_domain_search_unavailable',
				__( 'Domain search is temporarily unavailable.', 'wp-plugin-bluehost' ),
				array( 'status' => 502 )
			);
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( 200 !== $status || ! is_array( $body ) ) {
			return new \WP_Error(
				'bluehost_domain_search_bad_response',
				__( 'Domain search returned an unexpected response.', 'wp-plugin-bluehost' ),
				array( 'status' => 502 )
			);
		}

		$result = self::normalize_response( $body );
		set_transient( $cache_key, $result, 2 * MINUTE_IN_SECONDS );

		return new \WP_REST_Response( $result );
	}

	/**
	 * Build an SFBFF request URL.
	 *
	 * @param string $query Search query.
	 * @param string $mode  Search mode.
	 *
	 * @return string
	 */
	public function build_url( $query, $mode ) {
		$params = array(
			'brand'        => 'BLUEHOST',
			'env'          => 'prod',
			'flowId'       => '',
			'client'       => 'UPP',
			'currencyCode' => 'USD',
		);

		if ( 'ai' === $mode ) {
			$params['phrase'] = $query;
			return add_query_arg( $params, self::API_BASE . '/ai' );
		}

		$params['domains'] = strtolower( preg_replace( '/\s+/', '', $query ) );

		if ( 'availability' === $mode ) {
			$params['includePremiumDomainsInTopTlds'] = 'true';
			$params['spinDomainsWithoutTldsReq']      = 'true';
			$params['aftermarket']                    = 'true';
			return add_query_arg( $params, self::API_BASE . '/availability' );
		}

		if ( 'aftermarket' === $mode ) {
			$params['aftermarketAndPremiumOnly'] = 'true';
			return add_query_arg( $params, self::API_BASE );
		}

		$params = array_merge(
			$params,
			array(
				'useConfigTlds'                  => 'true',
				'spinSearch'                     => 'true',
				'aftermarketDomainsReq'          => 'true',
				'registryPremium'                => 'true',
				'includePremiumDomainsInTopTlds' => 'true',
				'spinDomainsWithoutTldsReq'      => 'true',
				'aftermarket'                    => 'true',
			)
		);

		$url = add_query_arg( $params, self::API_BASE );
		foreach ( array( '.com', '.ai', '.net', '.org', '.store', '.online', '.site', '.tech', '.info', '.biz', '.us', '.ca' ) as $tld ) {
			$url .= '&tldOrder=' . rawurlencode( $tld );
		}

		return $url;
	}

	/**
	 * Normalize all SFBFF response shapes into a stable result list.
	 *
	 * @param array $payload SFBFF payload.
	 *
	 * @return array
	 */
	public static function normalize_response( $payload ) {
		$data   = isset( $payload['response']['data'] ) && is_array( $payload['response']['data'] )
			? $payload['response']['data']
			: array();
		$groups = array(
			'searchedDomains',
			'topTldDomains',
			'aiAlternativeDomains',
			'spinDomains',
			'aftermarketDomains',
		);
		$items  = array();

		if ( isset( $data['domainName'] ) ) {
			$data['source'] = 'availability';
			$items[]        = self::normalize_domain( $data );
		} else {
			foreach ( $groups as $group ) {
				if ( empty( $data[ $group ] ) || ! is_array( $data[ $group ] ) ) {
					continue;
				}
				foreach ( $data[ $group ] as $domain ) {
					if ( is_array( $domain ) ) {
						$domain['source'] = $group;
						$items[]          = self::normalize_domain( $domain );
					}
				}
			}
		}

		$unique = array();
		foreach ( array_filter( $items ) as $item ) {
			$name = $item['domainName'];
			if ( ! isset( $unique[ $name ] ) ) {
				$unique[ $name ] = $item;
			}
		}

		return array(
			'results' => array_values( $unique ),
			'trace'   => isset( $payload['trace'] ) ? sanitize_text_field( $payload['trace'] ) : '',
		);
	}

	/**
	 * Normalize one domain.
	 *
	 * @param array $domain Domain data.
	 *
	 * @return array|null
	 */
	private static function normalize_domain( $domain ) {
		$name = isset( $domain['domainName'] ) ? strtolower( sanitize_text_field( $domain['domainName'] ) ) : '';
		if ( '' === $name ) {
			return null;
		}

		return array(
			'domainName'             => $name,
			'available'              => ! empty( $domain['isAvailable'] ) || ! empty( $domain['available'] ),
			'premium'                => ! empty( $domain['isPremium'] ) || ! empty( $domain['premium'] ) || ! empty( $domain['registryPremium'] ),
			'aftermarket'            => ! empty( $domain['isAftermarket'] ) || ! empty( $domain['aftermarket'] ),
			'price'                  => isset( $domain['unitPrice'] ) ? (float) $domain['unitPrice'] : null,
			'priceWithCurrency'      => isset( $domain['unitPriceWithCurrency'] ) ? sanitize_text_field( $domain['unitPriceWithCurrency'] ) : '',
			'renewPrice'             => isset( $domain['renewPrice'] ) ? (float) $domain['renewPrice'] : null,
			'renewPriceWithCurrency' => isset( $domain['renewPriceWithCurrency'] ) ? sanitize_text_field( $domain['renewPriceWithCurrency'] ) : '',
			'currency'               => isset( $domain['currency'] ) ? sanitize_text_field( $domain['currency'] ) : 'USD',
			'term'                   => isset( $domain['term'] ) ? sanitize_text_field( $domain['term'] ) : '',
			'source'                 => isset( $domain['source'] ) ? sanitize_key( $domain['source'] ) : '',
		);
	}

	/**
	 * Require an editor-capable authenticated user.
	 *
	 * @return bool|\WP_Error
	 */
	public function check_permission() {
		if ( ! current_user_can( 'edit_pages' ) ) {
			return new \WP_Error(
				'rest_forbidden_context',
				__( 'Sorry, you are not allowed to access this endpoint.', 'wp-plugin-bluehost' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}
}
