import './style.css';
import { checkPaymentEligibility } from './payments';

const config = window.BluehostTenWebDomainConnect;

if ( config?.contextUrl ) {
	const ROOT_ATTRIBUTE = 'data-bluehost-domain-connect';
	const MODAL_ID = 'bh-domain-connect-modal';
	const TRIGGER_ID = 'bh-domain-connect-header-trigger';
	const labels = {
		connect: 'Connect domain',
		preparing: 'Preparing domain selection…',
		unavailable:
			'Domain selection is unavailable. Reload the editor to try again.',
		error: 'Domain selection could not be opened. Reload the editor to try again.',
		purchased: 'Domain purchased: %s',
		...config.labels,
	};
	let wrapper;
	let button;
	let status;
	let timer;
	let contextPromise;
	let readinessPromise;
	let initializedMfe;
	let eligible = false;
	let phase = 'loading';
	let lastError = null;
	let lastReason = null;
	let lastEntryPoint = null;
	let isOpen = false;
	let purchasedDomain = '';

	const failure = ( code, reason = null ) => {
		const error = new Error( code );
		error.code = code;
		if ( reason ) {
			error.reason = reason;
		}
		return error;
	};

	const logDebug = ( event, detail = {} ) => {
		if ( ! config.debug ) {
			return;
		}
		// eslint-disable-next-line no-console -- WP_DEBUG diagnostics at the default console level; no credentials or wallet data.
		console.info(
			'[Bluehost Domain Connect]',
			event,
			JSON.stringify( detail )
		);
	};

	const logEntryPoint = ( outcome, reason ) => {
		const state = `${ outcome }:${ reason }`;
		if ( state !== lastEntryPoint ) {
			lastEntryPoint = state;
			logDebug( 'entry_point', { outcome, reason } );
		}
	};

	const invalidateContext = ( code, reason = null ) => {
		eligible = false;
		isOpen = false;
		lastError = code;
		lastReason = reason || code;
		phase = code === 'ineligible' ? 'ineligible' : 'error';
		wrapper?.remove();
		logEntryPoint( 'hidden', lastReason );
		try {
			initializedMfe?.close?.();
		} catch {
			// Keep the entry point hidden even if SDK cleanup fails.
		}
	};

	const fetchContext = () => {
		if ( ! contextPromise ) {
			logDebug( 'shopper_context', { outcome: 'loading' } );
			contextPromise = window
				.fetch( config.contextUrl, {
					headers: { 'X-WP-Nonce': config.nonce },
					credentials: 'same-origin',
					cache: 'no-store',
				} )
				.then( async ( response ) => {
					if ( ! response.ok ) {
						throw failure( 'context', `http_${ response.status }` );
					}
					let context;
					try {
						context = await response.json();
					} catch {
						throw failure( 'context', 'invalid_json' );
					}
					if (
						typeof context?.userJwt !== 'string' ||
						! context.userJwt.trim() ||
						! Number.isFinite( context.accountId ) ||
						context.accountId <= 0 ||
						! Number.isFinite( context.siteId ) ||
						context.siteId <= 0 ||
						typeof context.productInstanceId !== 'string' ||
						! context.productInstanceId.trim()
					) {
						throw failure( 'context', 'invalid_context' );
					}
					logDebug( 'shopper_context', { outcome: 'ready' } );
					logDebug( 'payment_eligibility', { outcome: 'checking' } );
					await checkPaymentEligibility( context );
					logDebug( 'payment_eligibility', { outcome: 'eligible' } );
					return context;
				} )
				.catch( ( error ) => {
					const code = [ 'ineligible', 'payments' ].includes(
						error?.code
					)
						? error.code
						: 'context';
					const reason = error?.reason || 'network';
					if ( code === 'ineligible' || code === 'payments' ) {
						logDebug( 'payment_eligibility', {
							outcome: code,
							reason,
						} );
					} else {
						logDebug( 'shopper_context', {
							outcome: 'error',
							reason,
						} );
					}
					invalidateContext( code, reason );
					throw failure( lastError, lastReason );
				} )
				.finally( () => {
					contextPromise = null;
				} );
		}
		return contextPromise;
	};

	const waitForMfe = () =>
		new Promise( ( resolve, reject ) => {
			if ( window.BhDomainConnect ) {
				resolve( window.BhDomainConnect );
				return;
			}
			let script = document.getElementById(
				config.mfeScriptId || 'bluehost-domain-connect-mfe-js'
			);
			const createScript = ! script;
			if ( createScript ) {
				if ( ! config.mfeScriptUrl || ! config.mfeStyleUrl ) {
					reject( failure( 'mfe_load' ) );
					return;
				}
				if (
					! document.getElementById(
						'bluehost-domain-connect-mfe-css'
					)
				) {
					const style = document.createElement( 'link' );
					style.id = 'bluehost-domain-connect-mfe-css';
					style.rel = 'stylesheet';
					style.href = config.mfeStyleUrl;
					document.head.appendChild( style );
				}
				script = document.createElement( 'script' );
				script.id =
					config.mfeScriptId || 'bluehost-domain-connect-mfe-js';
				script.type = 'module';
				script.src = config.mfeScriptUrl;
			}
			const started = Date.now();
			let poll;
			const cleanup = () => {
				window.clearTimeout( poll );
				script?.removeEventListener( 'error', onError );
			};
			const onError = () => {
				cleanup();
				if ( createScript ) {
					script.remove();
				}
				reject( failure( 'mfe_load' ) );
			};
			const tick = () => {
				if ( window.BhDomainConnect ) {
					cleanup();
					resolve( window.BhDomainConnect );
				} else if ( Date.now() - started >= 30000 ) {
					onError();
				} else {
					poll = window.setTimeout( tick, 100 );
				}
			};
			script?.addEventListener( 'error', onError, { once: true } );
			if ( createScript ) {
				document.body.appendChild( script );
			}
			tick();
		} );

	const syncHeader = () => {
		if ( ! button ) {
			return;
		}
		button.disabled = phase !== 'ready';
		button.setAttribute( 'aria-busy', String( phase === 'loading' ) );
		button.setAttribute( 'aria-expanded', String( isOpen ) );
		wrapper.dataset.phase = phase;
		let message = '';
		if ( phase === 'loading' ) {
			message = labels.preparing;
		} else if ( phase === 'error' ) {
			message =
				lastError === 'mfe_open' ? labels.error : labels.unavailable;
		} else if ( purchasedDomain ) {
			message = labels.purchased.replace( '%s', purchasedDomain );
		}
		status.textContent = message;
		button.title = phase === 'ready' ? labels.connect : message;
	};

	const finishClose = () => {
		isOpen = false;
		syncHeader();
	};

	const callbacks = {
		refreshJWT: async ( { accountId } ) => {
			const context = await fetchContext();
			if ( String( context.accountId ) !== String( accountId ) ) {
				logDebug( 'shopper_context', {
					outcome: 'error',
					reason: 'account_mismatch',
				} );
				invalidateContext( 'context', 'account_mismatch' );
				throw failure( 'context', 'account_mismatch' );
			}
			return context.userJwt.trim();
		},
		onPurchased: ( domain, order ) => {
			purchasedDomain = typeof domain === 'string' ? domain : '';
			finishClose();
			document.dispatchEvent(
				new CustomEvent( 'nfd:tenweb-domain-purchased', {
					detail: { domain, order, placement: 'header' },
				} )
			);
		},
		onDismissed: () => {
			finishClose();
			document.dispatchEvent(
				new CustomEvent( 'nfd:tenweb-domain-dismissed', {
					detail: { placement: 'header' },
				} )
			);
		},
	};

	const initialize = () => {
		if ( initializedMfe && eligible ) {
			phase = 'ready';
			lastError = null;
			lastReason = null;
			syncHeader();
			return Promise.resolve( true );
		}
		if ( readinessPromise ) {
			return readinessPromise;
		}
		phase = 'loading';
		lastError = null;
		syncHeader();
		readinessPromise = ( async () => {
			try {
				const context = await fetchContext();
				eligible = true;
				lastError = null;
				lastReason = null;
				// Do not create controls, a mount or request the SDK before eligibility.
				if ( ! document.getElementById( MODAL_ID ) ) {
					const host = document.createElement( 'div' );
					host.id = MODAL_ID;
					document.body.appendChild( host );
				}
				evaluate();
				logDebug( 'mfe', { outcome: 'loading' } );
				const mfe = await waitForMfe();
				if (
					typeof mfe.init !== 'function' ||
					typeof mfe.open !== 'function'
				) {
					throw failure( 'mfe_api' );
				}
				try {
					await mfe.init( {
						selector: MODAL_ID,
						anchor: `#${ TRIGGER_ID }`,
						zIndex: 100001,
						suggestedName: context.suggestedName,
						accountId: context.accountId,
						userJwt: context.userJwt,
						siteId: context.siteId,
						productInstanceId: context.productInstanceId,
						...( config.backendUrl
							? { backendUrl: config.backendUrl }
							: {} ),
						callbacks,
					} );
				} catch {
					throw failure( 'mfe_init' );
				}
				initializedMfe = mfe;
				phase = 'ready';
				logDebug( 'mfe', { outcome: 'ready' } );
				return true;
			} catch ( error ) {
				phase = error.code === 'ineligible' ? 'ineligible' : 'error';
				lastError = error.code || 'mfe_init';
				lastReason = error.reason || lastError;
				if (
					! [ 'context', 'payments', 'ineligible' ].includes(
						lastError
					)
				) {
					logDebug( 'mfe', { outcome: 'error', reason: lastReason } );
				}
				return false;
			} finally {
				syncHeader();
			}
		} )().finally( () => {
			readinessPromise = null;
		} );
		return readinessPromise;
	};

	// Context and initialization are already complete: the click only opens the SDK.
	const open = () => {
		if ( ! eligible || phase !== 'ready' || ! button?.isConnected ) {
			return false;
		}
		if ( isOpen ) {
			return true;
		}
		try {
			initializedMfe.open( { anchor: button } );
			isOpen = true;
			syncHeader();
			return true;
		} catch {
			phase = 'error';
			lastError = 'mfe_open';
			lastReason = lastError;
			logDebug( 'mfe', { outcome: 'error', reason: lastReason } );
			syncHeader();
			return false;
		}
	};

	const close = () => {
		initializedMfe?.close?.();
		finishClose();
	};

	const evaluate = () => {
		if ( ! eligible ) {
			wrapper?.remove();
			return;
		}
		const headerSelector =
			config.selectors?.header ||
			'.main-content-header, .header-wrapper > .header';
		const header = [ ...document.querySelectorAll( headerSelector ) ].find(
			( node ) => node.offsetWidth || node.offsetHeight
		);
		if ( ! header ) {
			logEntryPoint( 'hidden', 'header_missing' );
			return;
		}
		if ( ! wrapper ) {
			wrapper = document.createElement( 'div' );
			wrapper.className = 'bh-domain-connect-host--header';
			wrapper.setAttribute( ROOT_ATTRIBUTE, 'header' );
			button = document.createElement( 'button' );
			button.id = TRIGGER_ID;
			button.type = 'button';
			button.className = 'bh-domain-connect-entry';
			button.textContent = labels.connect;
			button.setAttribute( 'aria-haspopup', 'dialog' );
			button.setAttribute( 'aria-controls', MODAL_ID );
			button.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				event.stopPropagation();
				open();
			} );
			status = document.createElement( 'p' );
			status.className = 'bh-domain-connect-status';
			status.setAttribute( 'role', 'status' );
			status.setAttribute( 'aria-live', 'polite' );
			wrapper.append( button, status );
		}
		const anchor =
			header.querySelector(
				config.selectors?.headerAnchor || '.mw-min-content, .site-info'
			) || header.firstElementChild;
		if ( anchor && anchor !== wrapper ) {
			if ( anchor.nextElementSibling !== wrapper ) {
				anchor.after( wrapper );
			}
		} else if ( wrapper.parentElement !== header ) {
			header.appendChild( wrapper );
		}
		syncHeader();
		logEntryPoint( 'visible', 'eligible' );
	};

	const start = () => {
		logDebug( 'adapter', { outcome: 'started', debug: true } );
		initialize();
		// The editor may replace its header later; the body-level SDK host survives.
		const observer = new window.MutationObserver( ( records ) => {
			const external = records.some( ( record ) => {
				if (
					record.target.closest?.(
						`[${ ROOT_ATTRIBUTE }], #${ MODAL_ID }`
					)
				) {
					return false;
				}
				if ( record.type !== 'childList' ) {
					return true;
				}
				if (
					! wrapper?.isConnected &&
					[ ...record.removedNodes ].includes( wrapper )
				) {
					return true;
				}
				return [ ...record.addedNodes, ...record.removedNodes ].some(
					( node ) => node !== wrapper && node.id !== MODAL_ID
				);
			} );
			if ( external ) {
				window.clearTimeout( timer );
				timer = window.setTimeout( evaluate, 100 );
			}
		} );
		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'class' ],
		} );
	};

	window.BluehostTenWebDomainConnectDebug = {
		evaluate,
		placements: [ 'header' ],
		getPlacement: () => 'header',
		listAvailable: () => ( button?.isConnected ? [ 'header' ] : [] ),
		ready: initialize,
		retry: initialize,
		open,
		close,
		getState: () => ( {
			debug: Boolean( config.debug ),
			eligible,
			visible: Boolean(
				button?.isConnected &&
				( button.offsetWidth || button.offsetHeight )
			),
			phase,
			initialized: Boolean( initializedMfe ),
			pending: Boolean( readinessPromise ),
			isOpen,
			error: lastError,
			reason: lastReason,
		} ),
	};

	if ( document.body ) {
		start();
	} else {
		document.addEventListener( 'DOMContentLoaded', start, { once: true } );
	}
}
