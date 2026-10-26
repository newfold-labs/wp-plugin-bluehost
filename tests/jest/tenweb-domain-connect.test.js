/* global jest, describe, beforeEach, afterEach, it, expect, HTMLElement */
/** Host contract tests: the SDK is mocked; checkout and JWT acceptance are not. */
const flushPromises = async () => {
	for ( let step = 0; step < 24; step++ ) {
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

const contextResponse = ( context = makeContext() ) => ( {
	ok: true,
	json: () => Promise.resolve( context ),
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

describe( 'Domain Connect eager topbar integration', () => {
	let originalObserver;
	let observerCallback;
	let visibility;
	let readiness;

	const load = ( html = editorHtml ) => {
		document.body.innerHTML = html;
		require( '../../src/tenweb-domain-connect' );
		return window.BluehostTenWebDomainConnectDebug;
	};

	beforeEach( () => {
		jest.resetModules();
		jest.useFakeTimers();
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
		window.fetch = jest.fn( () => Promise.resolve( contextResponse() ) );
		window.BluehostTenWebDomainConnect = {
			contextUrl: '/wp-json/bluehost/v1/domain-connect/context',
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
	} );

	it( 'fetches context and initializes the hidden MFE before a click', async () => {
		const api = load();
		await flushPromises();
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
		await expect( api.ready() ).resolves.toBe( true );
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.fetch ).toHaveBeenCalledWith(
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
			phase: 'ready',
			initialized: true,
			pending: false,
			isOpen: false,
			error: null,
		} );
	} );

	it( 'keeps only one topbar control even with obsolete placement overrides', async () => {
		window.sessionStorage.setItem( 'bluehostDomainConnectPlacement', 'stage' );
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
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
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
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
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
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
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
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for a delayed SDK while preparing the protected context', async () => {
		const sdk = window.BhDomainConnect;
		delete window.BhDomainConnect;
		const api = load();
		await flushPromises();
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
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
		document
			.getElementById( 'bluehost-domain-connect-mfe-js' )
			.dispatchEvent( new Event( 'error' ) );
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'mfe_load' );
		expect( trigger().disabled ).toBe( true );
	} );

	it( 'retries failed SDK initialization and reuses a successful preparation', async () => {
		window.BhDomainConnect.init
			.mockRejectedValueOnce( new Error( 'SDK test initialization failed' ) )
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
		window.fetch
			.mockResolvedValueOnce( { ok: false, status: 500 } )
			.mockResolvedValueOnce( contextResponse() );
		const api = load();
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'context' );
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
		await expect( api.retry() ).resolves.toBe( true );
		expect( window.fetch ).toHaveBeenCalledTimes( 2 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		{ accountId: 0 },
		{ siteId: 0 },
		{ productInstanceId: '' },
		{ userJwt: '   ' },
		{ userJwt: 123 },
	] )( 'rejects malformed initial context %p', async ( overrides ) => {
		window.fetch.mockResolvedValueOnce(
			contextResponse( makeContext( overrides ) )
		);
		const api = load();
		await expect( api.ready() ).resolves.toBe( false );
		expect( api.getState().error ).toBe( 'context' );
		expect( trigger().disabled ).toBe( true );
		expect( window.BhDomainConnect.init ).not.toHaveBeenCalled();
	} );

	it( 'refreshes the SDK JWT with a fresh protected request and no reinitialization', async () => {
		const api = load();
		await api.ready();
		window.fetch.mockResolvedValueOnce(
			contextResponse( makeContext( { userJwt: 'fresh-test-credential' } ) )
		);
		await expect( callbacks().refreshJWT( { accountId: '1' } ) ).resolves.toBe(
			'fresh-test-credential'
		);
		expect( window.fetch ).toHaveBeenCalledTimes( 2 );
		expect( window.sessionStorage.length ).toBe( 0 );
		expect( window.localStorage.length ).toBe( 0 );
		expect( api.open() ).toBe( true );
		expect( window.fetch ).toHaveBeenCalledTimes( 2 );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'rejects refreshed credentials for a different account', async () => {
		const api = load();
		await api.ready();
		window.fetch.mockResolvedValueOnce(
			contextResponse( makeContext( { accountId: 3 } ) )
		);
		await expect(
			callbacks().refreshJWT( { accountId: 1 } )
		).rejects.toThrow();
	} );

	it( 'rejects refresh failure without discarding the initialized SDK', async () => {
		const api = load();
		await api.ready();
		window.fetch.mockResolvedValueOnce( { ok: false, status: 500 } );
		await expect(
			callbacks().refreshJWT( { accountId: 1 } )
		).rejects.toThrow();
		await expect( api.retry() ).resolves.toBe( true );
		expect( window.BhDomainConnect.init ).toHaveBeenCalledTimes( 1 );
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
			document.removeEventListener( 'nfd:tenweb-domain-dismissed', dismissed );
			document.removeEventListener( 'nfd:tenweb-domain-purchased', purchased );
		}
	} );
} );
