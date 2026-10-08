<?php

namespace Bluehost\RestApi;

use Bluehost\DomainConnect\Context;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Server;

/**
 * REST API for the domain-connect MFE host context.
 */
class DomainConnectController extends WP_REST_Controller {

	/**
	 * @var string
	 */
	protected $namespace = 'bluehost/v1';

	/**
	 * @var string
	 */
	protected $rest_base = 'domain-connect/context';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_context' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * @return bool|WP_Error
	 */
	public function check_permission() {
		if ( ! current_user_can( 'edit_pages' ) ) {
			return new WP_Error(
				'bluehost_domain_connect_forbidden',
				__( 'You do not have permission to access domain connect.', 'wp-plugin-bluehost' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_context() {
		$context = ( new Context() )->get_init_context();
		if ( is_wp_error( $context ) ) {
			return $context;
		}

		return rest_ensure_response( $context );
	}
}
