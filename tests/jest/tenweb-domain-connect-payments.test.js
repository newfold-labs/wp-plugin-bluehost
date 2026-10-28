/* global jest, describe, beforeEach, afterEach, it, expect */
import {
	checkPaymentEligibility,
	hasAvailablePaymentMethod,
} from '../../src/tenweb-domain-connect/payments';

const context = {
	accountId: 11,
	userJwt: 'synthetic-jwt',
	paymentsUrl: 'https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments',
};
const card = { walletItemId: 'wallet', lastFourDigits: '1234', expired: false };

describe( 'Browser payment eligibility', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		window.fetch = jest.fn( () =>
			Promise.resolve( {
				ok: true,
				json: async () => ( { payments: [ card ] } ),
			} )
		);
	} );
	afterEach( () => {
		delete window.fetch;
		jest.clearAllTimers();
		jest.useRealTimers();
	} );

	it.each( [
		[ [ card ], true ],
		[ [ { walletItemId: 1, email: 'test@example.test' } ], true ],
		[ [], false ],
		[ [ { ...card, expired: true } ], false ],
		[ [ { ...card, expired: 'false' } ], false ],
		[ [ { ...card, walletItemId: '' } ], false ],
		[ [ { ...card, walletItemId: null } ], false ],
		[ [ { ...card, walletItemId: [] } ], false ],
		[ [ { walletItemId: 1 } ], false ],
		[ [ null, 'invalid', [] ], false ],
		[ [ { ...card, expired: true }, card ], true ],
	] )( 'checks selectable methods in %p', ( payments, expected ) => {
		expect( hasAvailablePaymentMethod( { payments } ) ).toBe( expected );
	} );

	it( 'uses the same account-scoped browser GET as the MFE', async () => {
		await expect( checkPaymentEligibility( context ) ).resolves.toBe(
			true
		);
		expect( window.fetch ).toHaveBeenCalledWith( context.paymentsUrl, {
			method: 'GET',
			headers: {
				Authorization: 'Bearer synthetic-jwt',
				'X-Account-Id': '11',
				Accept: 'application/json',
			},
			mode: 'cors',
			credentials: 'omit',
			cache: 'no-store',
			redirect: 'error',
			signal: expect.any( window.AbortSignal ),
		} );
	} );

	it( 'throws ineligible when the wallet is empty', async () => {
		window.fetch.mockResolvedValueOnce( {
			ok: true,
			json: async () => ( { payments: [] } ),
		} );
		await expect(
			checkPaymentEligibility( context )
		).rejects.toMatchObject( {
			code: 'ineligible',
			reason: 'empty_wallet',
		} );
	} );

	it.each( [ 401, 403, 500 ] )(
		'fails closed on HTTP %i',
		async ( status ) => {
			window.fetch.mockResolvedValueOnce( { ok: false, status } );
			await expect(
				checkPaymentEligibility( context )
			).rejects.toMatchObject( {
				code: 'payments',
				reason: `http_${ status }`,
			} );
		}
	);

	it.each( [ {}, { payments: null }, { payments: {} } ] )(
		'rejects an invalid response %p',
		async ( payload ) => {
			window.fetch.mockResolvedValueOnce( {
				ok: true,
				json: async () => payload,
			} );
			await expect(
				checkPaymentEligibility( context )
			).rejects.toMatchObject( {
				code: 'payments',
				reason: 'invalid_payload',
			} );
		}
	);

	it( 'rejects HTML challenge responses instead of enabling the MFE', async () => {
		window.fetch.mockResolvedValueOnce( {
			ok: true,
			json: async () => {
				throw new SyntaxError( 'HTML challenge' );
			},
		} );
		await expect(
			checkPaymentEligibility( context )
		).rejects.toMatchObject( {
			code: 'payments',
			reason: 'invalid_json',
		} );
	} );

	it( 'does not send the JWT to unexpected endpoints', async () => {
		await expect(
			checkPaymentEligibility( {
				...context,
				paymentsUrl: 'https://example.test',
			} )
		).rejects.toMatchObject( {
			code: 'payments',
			reason: 'disallowed_endpoint',
		} );
		expect( window.fetch ).not.toHaveBeenCalled();
	} );

	it( 'aborts a payment check after ten seconds', async () => {
		window.fetch.mockImplementationOnce(
			( url, { signal } ) =>
				new Promise( ( resolve, reject ) => {
					signal.addEventListener( 'abort', () =>
						reject( new DOMException( 'Aborted', 'AbortError' ) )
					);
				} )
		);
		const pending = checkPaymentEligibility( context );
		const assertion = expect( pending ).rejects.toMatchObject( {
			code: 'payments',
			reason: 'timeout',
		} );
		jest.advanceTimersByTime( 10000 );
		await assertion;
	} );
} );
