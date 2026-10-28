const PAYMENT_ENDPOINTS = [
	'https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments',
	'https://sfbff-user-service-bh-qa.apis.newfold.com/api/v1/ms-shopping/get-payments',
];

const hasValue = ( value ) =>
	( typeof value === 'string' && value.trim() !== '' ) ||
	( Number.isInteger( value ) && value > 0 );

const eligibilityError = ( code, reason ) => {
	const error = new Error( code );
	error.code = code;
	error.reason = reason;
	return error;
};

/**
 * Apply the checkout MFE's selectable wallet rule. Null means an invalid payload.
 *
 * @param {Object} payload Payment API response.
 * @return {boolean|null} Saved method eligibility.
 */
export const hasAvailablePaymentMethod = ( payload ) => {
	if ( ! Array.isArray( payload?.payments ) ) {
		return null;
	}
	return payload.payments.some(
		( payment ) =>
			payment &&
			typeof payment === 'object' &&
			! Array.isArray( payment ) &&
			( ! Object.prototype.hasOwnProperty.call( payment, 'expired' ) ||
				payment.expired === false ) &&
			hasValue( payment.walletItemId ) &&
			( hasValue( payment.lastFourDigits ) ||
				( typeof payment.email === 'string' &&
					payment.email.trim() !== '' ) )
	);
};

/**
 * Use the same browser-authenticated request as the MFE, before loading the SDK.
 * Never return or persist wallet details, and never send the JWT to other URLs.
 *
 * @param {Object} context Trusted WordPress shopper context.
 * @return {Promise<true>} Resolves when a selectable saved method exists.
 * @throws {Error} code `ineligible` (empty wallet) or `payments` (request/payload).
 */
export const checkPaymentEligibility = async ( context ) => {
	if ( ! PAYMENT_ENDPOINTS.includes( context.paymentsUrl ) ) {
		throw eligibilityError( 'payments', 'disallowed_endpoint' );
	}
	const controller = new window.AbortController();
	// eslint-disable-next-line @wordpress/no-unused-vars-before-return -- Cleared in finally on every return and error path.
	const timer = window.setTimeout( () => controller.abort(), 10000 );
	try {
		const response = await window.fetch( context.paymentsUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${ context.userJwt.trim() }`,
				'X-Account-Id': String( context.accountId ),
				Accept: 'application/json',
			},
			mode: 'cors',
			credentials: 'omit',
			cache: 'no-store',
			redirect: 'error',
			signal: controller.signal,
		} );
		if ( ! response.ok ) {
			throw eligibilityError( 'payments', `http_${ response.status }` );
		}
		let payload;
		try {
			payload = await response.json();
		} catch {
			throw eligibilityError( 'payments', 'invalid_json' );
		}
		const eligible = hasAvailablePaymentMethod( payload );
		if ( eligible === null ) {
			throw eligibilityError( 'payments', 'invalid_payload' );
		}
		if ( ! eligible ) {
			throw eligibilityError( 'ineligible', 'empty_wallet' );
		}
		return true;
	} catch ( error ) {
		if ( [ 'payments', 'ineligible' ].includes( error?.code ) ) {
			throw error;
		}
		const reason = error?.name === 'AbortError' ? 'timeout' : 'network';
		throw eligibilityError( 'payments', reason );
	} finally {
		window.clearTimeout( timer );
	}
};
