/* global jest, describe, beforeEach, afterEach, it, expect, HTMLElement */
/** Host contract tests: the SDK is mocked; checkout and JWT acceptance are not. */
const flushPromises = async () => {
	for ( let step = 0; step < 40; step++ ) {
		await Promise.resolve();
	}
};

const deferred = () => {
	let resolve;
	const promise = new Promise( ( done ) => {
		resolve = done;
	} );
	return { promise, resolve };
};

const makeContext = ( overrides = {} ) => ( {
	accountId: 1,
	siteId: 2,
	productInstanceId: 'WN.HP.3',
	userJwt: 'test-credential',
	suggestedName: 'Example',
	...overrides,
} );

const paymentsUrl =
	'https://sfbff.bluehost.com/api/v1/ms-shopping/get-payments';
const paymentResponse = (
	payments = [ { walletItemId: 1, lastFourDigits: '1234', expired: false } ]
) => ( { ok: true, json: () => Promise.resolve( { payments } ) } );

const contextResponse = ( context = makeContext() ) => ( {
	ok: true,
	json: () => Promise.resolve( { paymentsUrl, ...context } ),
} );

const headerHtml = '<div class="header"><span class="title">Site</span></div>';
const editorHtml =
	headerHtml +
	'<div class="stage"><div data-wvc-stage="onboarding">Building</div></div>' +
	'<div class="sidebar open"><div class="messages-container">Hello</div><div class="chat"><textarea></textarea></div></div>' +
	'<div class="menu">Publish</div>';
const trigger = () =>
	document.getElementById( 'bh-domain-connect-header-trigger' );
const mount = () =>
	document.querySelector( '[data-bluehost-domain-connect="header"]' );
const callbacks = () =>
	window.BhDomainConnect.init.mock.calls[ 0 ][ 0 ].callbacks;

const makeSdk = () => ( {
	init: jest.fn( () => Promise.resolve() ),
	open: jest.fn(),
	close: jest.fn(),
} );

describe( 'Domain Connect payment-gated topbar integration', () => {
	let originalObserver;
	let observerCallback;
	let visibility;
	let readiness;
	let contextFetchMock;
	let paymentFetchMock;
	let infoLog;
	let debugLog;

	const load = ( html = editorHtml ) => {
		document.body.innerHTML = html;
		require( '../../src/tenweb-domain-connect' );
		return window.BluehostTenWebDomainConnectDebug;
	};

	beforeEach( () => {
		jest.resetModules();
		jest.useFakeTimers();
		infoLog = jest.spyOn( console, 'info' ).mockImplementation( () => {} );
		debugLog = jest
			.spyOn( console, 'debug' )
			.mockImplementation( () => {} );
		window.sessionStorage.clear();
		window.localStorage.clear();
		originalObserver = window.MutationObserver;
		observerCallback = null;
		window.MutationObserver = jest.fn( ( callback ) => {
			observerCallback = callback;
			return { observe: jest.fn(), disconnect: jest.fn() };
		} );
		readiness = jest
			.spyOn( document, 'readyState', 'get' )
			.mockReturnValue( 'complete' );
		visibility = jest
			.spyOn( HTMLElement.prototype, 'offsetWidth', 'get' )
			.mockReturnValue( 100 );
		window.WVC = { isBuiltWithWvc: false };
		window.BhDomainConnect = makeSdk();
		contextFetchMock = jest.fn( () =>
			Promise.resolve( contextResponse() )
		);
		paymentFetchMock = jest.fn( () =>
			Promise.resolve( paymentResponse() )
		);
		window.fetch = ( url, options ) =>
			url === '/wp-json/bluehost/v1/domain-connect/context'
				? contextFetchMock( url, options )
				: paymentFetchMock( url, options );
		window.BluehostTenWebDomainConnect = {
			contextUrl: '/wp-json/bluehost/v1/domain-connect/context',
			mfeScriptUrl: 'https://example.test/domain-connect/main.js',
			mfeStyleUrl: 'https://example.test/domain-connect/styles.css',
			nonce: 'test-wordpress-nonce',
			placement: 'all',
			selectors: {
				stage: '.stage',
				stageAnchor: '[data-wvc-stage="onboarding"]',
				stageReady: '.preview, iframe',
				chat: '.chat',
				chatThread: '.messages-container',
				header: '.header',
				headerAnchor: '.title',
				publishMenu: '.menu',
			},
		};
	} );

	afterEach( () => {
		infoLog.mockRestore();
		debugLog.mockRestore();
		window.MutationObserver = originalObserver;
		visibility.mockRestore();
		readiness.mockRestore();
		jest.clearAllTimers();
		jest.useRealTimers();
		delete window.BluehostTenWebDomainConnect;
		delete window.BluehostTenWebDomainConnectDebug;
		delete window.BhDomainConnect;
		delete window.WVC;
		delete window.fetch;
		if ( ! document.body ) {
			document.documentElement.appendChild(
				document.createElement( 'body' )
			);
		}
		document.body.innerHTML = '';
		document.getElementById( 'bluehost-domain-connect-mfe-css' )?.remove();
	} );

	it( 'fetches context and initializes the hidden MFE before a click', async () => {
		const api = load();
		await flushPromises();
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
		await expect( api.ready() ).resolves.toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( contextFetchMock ).toHaveBeenCalledWith(
			'/wp-json/bluehost/v1/domain-connect/context',
			{
				headers: { 'X-WP-Nonce': 'test-wordpress-nonce' },
				credentials: 'same-origin',
				cache: 'no-store',
			}
		);
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledWith(
			expect.objectContaining( {
				...makeContext(),
				selector: 'bh-domain-connect-modal',
				anchor: '#bh-domain-connect-header-trigger',
				zIndex: 100001,
				callbacks: expect.objectContaining( {
					onPurchased: expect.any( Function ),
					onDismissed: expect.any( Function ),
					refreshJWT: expect.any( Function ),
				} ),
			} )
		);
		expect( window.BhDomainConnect.open ).not.toHaveBeenCalled();
		expect( trigger().disabled ).toBe( false );
		expect( api.getState() ).toEqual( {
			debug: false,
			eligible: true,
			visible: true,
			phase: 'ready',
			initialized: true,
			pending: false,
			isOpen: false,
			error: null,
			reason: null,
		} );
	} );

	it( 'keeps only one topbar control even with obsolete placement overrides', async () => {
		window.sessionStorage.setItem(
			'bluehostDomainConnectPlacement',
			'stage'
		);
		const api = load();
		await api.ready();
		expect(
			document.querySelectorAll( '[data-bluehost-domain-connect]' )
		).toHaveLength( 1 );
		expect( mount().closest( '.header' ) ).not.toBeNull();
		expect(
			document.querySelectorAll( '#bh-domain-connect-header-trigger' )
		).toHaveLength( 1 );
	} );

	it( 'opens immediately from the prepared topbar without another context request or init', async () => {
		const api = load();
		await api.ready();
		trigger().click();
		expect( window.BhDomainConnect.open ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.open ).toHaveBeenCalledWith( {
			anchor: trigger(),
		} );
		expect( api.getState().isOpen ).toBe( true );
		api.close();
		expect( window.BhDomainConnect.close ).toHaveBeenCalledTimes( 1 );
		expect( api.getState().isOpen ).toBe( false );
		expect( api.open() ).toBe( true );
		expect( window.BhDomainConnect.open ).toHaveBeenCalledTimes( 2 );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables the trigger while SDK initialization is pending', async () => {
		const initialization = deferred();
		window.BhDomainConnect.init.mockReturnValue( initialization.promise );
		const api = load();
		await flushPromises();
		expect( api.getState().phase ).toBe( 'loading' );
		expect( api.getState().pending ).toBe( true );
		expect( trigger().disabled ).toBe( true );
		expect( api.open() ).toBe( false );
		trigger().click();
		expect( window.BhDomainConnect.open ).not.toHaveBeenCalled();
		initialization.resolve();
		await expect( api.ready() ).resolves.toBe( true );
		expect( trigger().disabled ).toBe( false );
	} );

	it( 'prepares the MFE without a header and mounts the trigger when the topbar appears', async () => {
		const api = load( '' );
		await expect( api.ready() ).resolves.toBe( true );
		expect( trigger() ).toBeNull();
		expect( api.open() ).toBe( false );
		document.body.insertAdjacentHTML( 'beforeend', headerHtml );
		api.evaluate();
		expect( trigger().disabled ).toBe( false );
		expect( api.open() ).toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'starts eager preparation when a delayed body becomes available', async () => {
		readiness.mockReturnValue( 'loading' );
		document.body.remove();
		require( '../../src/tenweb-domain-connect' );
		const api = window.BluehostTenWebDomainConnectDebug;
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		const body = document.createElement( 'body' );
		body.innerHTML = headerHtml;
		document.documentElement.appendChild( body );
		document.dispatchEvent( new Event( 'DOMContentLoaded' ) );
		await expect( api.ready() ).resolves.toBe( true );
		expect( trigger().disabled ).toBe( false );
		expect(
			document.getElementById( 'bh-domain-connect-modal' )
		).not.toBeNull();
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reuses the same trigger after the editor replaces its header markup', async () => {
		const api = load();
		await api.ready();
		const original = trigger();
		document.querySelector( '.header' ).innerHTML =
			'<span class="title">Updated site</span>';
		api.evaluate();
		api.evaluate();
		expect( trigger() ).toBe( original );
		expect( original.isConnected ).toBe( true );
		expect(
			document.querySelectorAll( '[data-bluehost-domain-connect]' )
		).toHaveLength( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
		expect( api.open() ).toBe( true );
		expect( window.BhDomainConnect.open ).toHaveBeenLastCalledWith( {
			anchor: original,
		} );
	} );

	it( 'automatically restores the same trigger when the editor removes only its injected wrapper', async () => {
		const api = load();
		await api.ready();
		const originalTrigger = trigger();
		const originalMount = mount();
		const header = originalMount.parentElement;
		originalMount.remove();
		observerCallback( [
			{
				type: 'childList',
				target: header,
				addedNodes: [],
				removedNodes: [ originalMount ],
			},
		] );
		jest.advanceTimersByTime( 150 );
		expect( trigger() ).toBe( originalTrigger );
		expect( originalTrigger.isConnected ).toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for a delayed SDK while preparing the protected context', async () => {
		const sdk = window.BhDomainConnect;
		delete window.BhDomainConnect;
		const api = load();
		await flushPromises();
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( trigger().disabled ).toBe( true );
		expect( api.open() ).toBe( false );
		window.BhDomainConnect = sdk;
		jest.advanceTimersByTime( 100 );
		await expect( api.ready() ).resolves.toBe( true );
		expect( sdk.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports SDK load timeout without initializing or opening the flow', async () => {
		const sdk = window.BhDomainConnect;
		delete window.BhDomainConnect;
		const api = load();
		await flushPromises();
		jest.advanceTimersByTime( 30100 );
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState() ).toEqual(
			expect.objectContaining( {
				phase: 'error',
				error: 'mfe_load',
				initialized: false,
				pending: false,
			} )
		);
		expect( trigger().disabled ).toBe( true );
		expect( api.open() ).toBe( false );
		expect( sdk.init ).not.toHaveBeenCalled();
	} );

	it( 'reports an explicit MFE script load failure', async () => {
		delete window.BhDomainConnect;
		const api = load(
			headerHtml + '<script id="bluehost-domain-connect-mfe-js"></script>'
		);
		await flushPromises();
		document
			.getElementById( 'bluehost-domain-connect-mfe-js' )
			.dispatchEvent( new Event( 'error' ) );
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'mfe_load' );
		expect( trigger().disabled ).toBe( true );
	} );

	it( 'retries failed SDK initialization and reuses a successful preparation', async () => {
		window.BhDomainConnect.init
			.mockRejectedValueOnce(
				new Error( 'SDK test initialization failed' )
			)
			.mockResolvedValueOnce();
		const api = load();
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'mfe_init' );
		expect( api.open() ).toBe( false );
		await expect( api.retry() ).resolves.toBe( true );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 2 );
		await expect( api.retry() ).resolves.toBe( true );
		await expect( api.ready() ).resolves.toBe( true );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'retries a failed context request before initializing the SDK', async () => {
		contextFetchMock
			.mockResolvedValueOnce( { ok: false, status: 500 } )
			.mockResolvedValueOnce( contextResponse() );
		const api = load();
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'context' );
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		await expect( api.retry() ).resolves.toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 2 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		{ accountId: 0 },
		{ siteId: 0 },
		{ productInstanceId: '' },
		{ userJwt: '   ' },
		{ userJwt: 123 },
	] )( 'rejects malformed initial context %p', async ( overrides ) => {
		contextFetchMock.mockResolvedValueOnce(
			contextResponse( makeContext( overrides ) )
		);
		const api = load();
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'context' );
		expect( trigger() ).toBeNull();
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
	} );

	it( 'refreshes the SDK JWT with a fresh protected request and no reinitialization', async () => {
		const api = load();
		await api.ready();
		contextFetchMock.mockResolvedValueOnce(
			contextResponse(
				makeContext( { userJwt: 'fresh-test-credential' } )
			)
		);
		await expect(
			callbacks().refreshJWT( { accountId: '1' } )
		).resolves.toBe( 'fresh-test-credential' );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 2 );
		expect( window.sessionStorage.length ).toBe( 0 );
		expect( window.localStorage.length ).toBe( 0 );
		expect( api.open() ).toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 2 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'rejects refreshed credentials for a different account', async () => {
		const api = load();
		await api.ready();
		contextFetchMock.mockResolvedValueOnce(
			contextResponse( makeContext( { accountId: 3 } ) )
		);
		await expect(
			callbacks().refreshJWT( { accountId: 1 } )
		).rejects.toThrow();
	} );

	it( 'hides the entry point on refresh failure and rechecks before retrying', async () => {
		const api = load();
		await api.ready();
		contextFetchMock.mockResolvedValueOnce( { ok: false, status: 500 } );
		await expect(
			callbacks().refreshJWT( { accountId: 1 } )
		).rejects.toThrow();
		expect( trigger() ).toBeNull();
		expect( api.open() ).toBe( false );
		await expect( api.retry() ).resolves.toBe( true );
		expect( contextFetchMock ).toHaveBeenCalledTimes( 3 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'requests no remote MFE assets and renders nothing while eligibility is pending', async () => {
		delete window.BhDomainConnect;
		const pending = deferred();
		contextFetchMock.mockReturnValueOnce( pending.promise );
		const api = load();
		await flushPromises();
		expect( trigger() ).toBeNull();
		expect(
			document.getElementById( 'bh-domain-connect-modal' )
		).toBeNull();
		expect(
			document.getElementById( 'bluehost-domain-connect-mfe-js' )
		).toBeNull();
		expect(
			document.getElementById( 'bluehost-domain-connect-mfe-css' )
		).toBeNull();
		paymentFetchMock.mockResolvedValueOnce( paymentResponse( [] ) );
		pending.resolve( contextResponse() );
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().phase ).toBe( 'ineligible' );
		expect( api.getState().reason ).toBe( 'empty_wallet' );
		api.evaluate();
		expect( trigger() ).toBeNull();
		expect(
			document.getElementById( 'bluehost-domain-connect-mfe-js' )
		).toBeNull();
	} );

	it( 'loads the module and stylesheet only after a positive payment check', async () => {
		const sdk = window.BhDomainConnect;
		delete window.BhDomainConnect;
		const api = load();
		await flushPromises();
		const script = document.getElementById(
			'bluehost-domain-connect-mfe-js'
		);
		expect( script.type ).toBe( 'module' );
		expect( script.src ).toBe(
			window.BluehostTenWebDomainConnect.mfeScriptUrl
		);
		expect(
			document.getElementById( 'bluehost-domain-connect-mfe-css' ).href
		).toBe( window.BluehostTenWebDomainConnect.mfeStyleUrl );
		window.BhDomainConnect = sdk;
		jest.advanceTimersByTime( 100 );
		await expect( api.ready() ).resolves.toBe( true );
	} );

	it.each( [
		{ ok: false, status: 401 },
		{ ok: false, status: 502 },
	] )(
		'does not load or mount the MFE when the check fails: %p',
		async ( response ) => {
			const sdk = window.BhDomainConnect;
			delete window.BhDomainConnect;
			contextFetchMock.mockResolvedValueOnce( response );
			const api = load();
			await expect( api.ready() ).resolves.toBe( false );
			api.evaluate();
			expect( trigger() ).toBeNull();
			expect(
				document.getElementById( 'bh-domain-connect-modal' )
			).toBeNull();
			expect(
				document.getElementById( 'bluehost-domain-connect-mfe-js' )
			).toBeNull();
			expect(
				document.getElementById( 'bluehost-domain-connect-mfe-css' )
			).toBeNull();
			expect( sdk.init ).not.toHaveBeenCalled();
		}
	);

	it( 'closes the MFE and removes the control if a refresh finds no saved method', async () => {
		const api = load();
		await api.ready();
		api.open();
		paymentFetchMock.mockResolvedValueOnce( paymentResponse( [] ) );
		await expect(
			callbacks().refreshJWT( { accountId: 1 } )
		).rejects.toThrow();
		expect( trigger() ).toBeNull();
		expect( window.BhDomainConnect.close ).toHaveBeenCalled();
		expect( api.getState().phase ).toBe( 'ineligible' );
		expect( api.open() ).toBe( false );
	} );

	it( 'keeps all MFE UI and assets absent until the browser payment API confirms eligibility', async () => {
		const pending = deferred();
		paymentFetchMock.mockReturnValueOnce( pending.promise );
		const api = load();
		await flushPromises();
		expect( contextFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( paymentFetchMock ).toHaveBeenCalledTimes( 1 );
		expect( trigger() ).toBeNull();
		expect(
			document.getElementById( 'bh-domain-connect-modal' )
		).toBeNull();
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		pending.resolve( paymentResponse() );
		await expect( api.ready() ).resolves.toBe( true );
	} );

	it.each( [
		{ ok: false, status: 403 },
		paymentResponse( [] ),
		{ ok: true, json: async () => ( {} ) },
	] )(
		'renders nothing for a denied or invalid payment API response: %p',
		async ( response ) => {
			paymentFetchMock.mockResolvedValueOnce( response );
			const api = load();
			await expect( api.ready() ).resolves.toBe( false );
			expect( trigger() ).toBeNull();
			expect(
				document.getElementById( 'bh-domain-connect-modal' )
			).toBeNull();
			expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		}
	);

	it( 'keeps console diagnostics off unless WP_DEBUG enables them', async () => {
		paymentFetchMock.mockResolvedValueOnce( paymentResponse( [] ) );
		await load().ready();
		expect( infoLog ).not.toHaveBeenCalled();
		expect( debugLog ).not.toHaveBeenCalled();
	} );

	it( 'logs startup and successful eligibility at the default console level without shopper data', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		const api = load();
		await api.ready();
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'adapter',
			JSON.stringify( { outcome: 'started', debug: true } )
		);
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'payment_eligibility',
			JSON.stringify( { outcome: 'eligible' } )
		);
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'mfe',
			JSON.stringify( { outcome: 'ready' } )
		);
		const logged = JSON.stringify( infoLog.mock.calls );
		expect( logged ).not.toMatch(
			/test-credential|1234|walletItemId|userJwt|test-wordpress-nonce/
		);
		expect( debugLog ).not.toHaveBeenCalled();
		expect( api.getState() ).toEqual(
			expect.objectContaining( {
				debug: true,
				eligible: true,
				visible: true,
			} )
		);
	} );

	it.each( [
		[ paymentResponse( [] ), 'ineligible', 'empty_wallet' ],
		[ { ok: false, status: 403 }, 'payments', 'http_403' ],
		[
			{ ok: true, json: async () => ( {} ) },
			'payments',
			'invalid_payload',
		],
	] )(
		'distinguishes a missing payment method from an API error in console diagnostics: %p',
		async ( response, outcome, reason ) => {
			window.BluehostTenWebDomainConnect.debug = true;
			paymentFetchMock.mockResolvedValueOnce( response );
			const api = load();
			await api.ready();
			expect( infoLog ).toHaveBeenCalledWith(
				'[Bluehost Domain Connect]',
				'payment_eligibility',
				JSON.stringify( { outcome, reason } )
			);
			expect( api.getState().reason ).toBe( reason );
			expect( trigger() ).toBeNull();
			expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ { ok: false, status: 401 }, 'http_401' ],
		[
			{
				ok: true,
				json: async () => {
					throw new Error( 'private response body' );
				},
			},
			'invalid_json',
		],
		[
			contextResponse( makeContext( { accountId: 0 } ) ),
			'invalid_context',
		],
	] )(
		'reports context failures without logging response bodies: %p',
		async ( response, reason ) => {
			window.BluehostTenWebDomainConnect.debug = true;
			contextFetchMock.mockResolvedValueOnce( response );
			const api = load();
			await api.ready();
			expect( infoLog ).toHaveBeenCalledWith(
				'[Bluehost Domain Connect]',
				'shopper_context',
				JSON.stringify( { outcome: 'error', reason } )
			);
			expect( JSON.stringify( infoLog.mock.calls ) ).not.toContain(
				'private response body'
			);
			expect( api.getState().reason ).toBe( reason );
			expect( paymentFetchMock ).not.toHaveBeenCalled();
		}
	);

	it( 'keeps a native payment AbortError classified as a payment timeout', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		paymentFetchMock.mockRejectedValueOnce(
			new DOMException( 'Aborted', 'AbortError' )
		);
		const api = load();
		await api.ready();
		expect( api.getState() ).toEqual(
			expect.objectContaining( { error: 'payments', reason: 'timeout' } )
		);
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'payment_eligibility',
			JSON.stringify( { outcome: 'payments', reason: 'timeout' } )
		);
	} );

	it( 'logs MFE initialization errors with only a safe reason code', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		window.BhDomainConnect.init.mockRejectedValueOnce(
			new Error( 'private SDK data' )
		);
		await load().ready();
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'mfe',
			JSON.stringify( { outcome: 'error', reason: 'mfe_init' } )
		);
		expect( JSON.stringify( infoLog.mock.calls ) ).not.toContain(
			'private SDK data'
		);
	} );

	it( 'logs remote MFE load failures after a successful payment check', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		delete window.BhDomainConnect;
		const api = load();
		await flushPromises();
		document
			.getElementById( 'bluehost-domain-connect-mfe-js' )
			.dispatchEvent( new Event( 'error' ) );
		await api.ready();
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'mfe',
			JSON.stringify( { outcome: 'error', reason: 'mfe_load' } )
		);
	} );

	it( 'logs a failure to open the prepared MFE', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		const api = load();
		await api.ready();
		window.BhDomainConnect.open.mockImplementationOnce( () => {
			throw new Error( 'private SDK data' );
		} );
		expect( api.open() ).toBe( false );
		expect( infoLog ).toHaveBeenCalledWith(
			'[Bluehost Domain Connect]',
			'mfe',
			JSON.stringify( { outcome: 'error', reason: 'mfe_open' } )
		);
		expect( api.getState().reason ).toBe( 'mfe_open' );
		await api.retry();
		expect( api.getState() ).toEqual(
			expect.objectContaining( {
				phase: 'ready',
				error: null,
				reason: null,
			} )
		);
	} );

	it( 'reports a missing editor header once and then reports the restored entry point', async () => {
		window.BluehostTenWebDomainConnect.debug = true;
		const api = load( '<div class="stage"></div>' );
		await api.ready();
		api.evaluate();
		api.evaluate();
		const hidden = infoLog.mock.calls.filter(
			( call ) => call[ 1 ] === 'entry_point'
		);
		expect( hidden ).toEqual( [
			[
				'[Bluehost Domain Connect]',
				'entry_point',
				JSON.stringify( {
					outcome: 'hidden',
					reason: 'header_missing',
				} ),
			],
		] );
		document.body.insertAdjacentHTML( 'afterbegin', headerHtml );
		api.evaluate();
		expect( infoLog ).toHaveBeenLastCalledWith(
			'[Bluehost Domain Connect]',
			'entry_point',
			JSON.stringify( { outcome: 'visible', reason: 'eligible' } )
		);
	} );

	it( 'reports dismissal and purchase with the topbar origin', async () => {
		const api = load();
		await api.ready();
		const dismissed = jest.fn();
		const purchased = jest.fn();
		document.addEventListener( 'nfd:tenweb-domain-dismissed', dismissed );
		document.addEventListener( 'nfd:tenweb-domain-purchased', purchased );
		try {
			expect( api.open() ).toBe( true );
			callbacks().onDismissed();
			expect( api.getState().isOpen ).toBe( false );
			expect( dismissed.mock.calls[ 0 ][ 0 ].detail ).toEqual( {
				placement: 'header',
			} );
			expect( api.open() ).toBe( true );
			const order = { orderId: 'test-order' };
			callbacks().onPurchased( 'example.com', order );
			expect( api.getState().isOpen ).toBe( false );
			expect( purchased.mock.calls[ 0 ][ 0 ].detail ).toEqual( {
				domain: 'example.com',
				order,
				placement: 'header',
			} );
		} finally {
			document.removeEventListener(
				'nfd:tenweb-domain-dismissed',
				dismissed
			);
			document.removeEventListener(
				'nfd:tenweb-domain-purchased',
				purchased
			);
		}
	} );
} );
