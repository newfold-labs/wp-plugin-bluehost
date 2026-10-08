import './style.css';

const config = window.BluehostTenWebDomainConnect;

if ( config?.contextUrl ) {
	const ROOT_ATTRIBUTE = 'data-bluehost-domain-connect';
	const MOUNT_ID_PREFIX = 'bh-domain-connect';
	const PLACEMENTS = [ 'stage', 'chat', 'header', 'publish' ];
	const OVERRIDE_KEY = 'bluehostDomainConnectPlacement';
	const requestedFromUrl = new URLSearchParams( window.location.search ).get(
		'bhDomainConnectPlacement'
	);

	if ( requestedFromUrl ) {
		window.sessionStorage.setItem(
			OVERRIDE_KEY,
			requestedFromUrl.toLowerCase()
		);
	}

	let placementOverride = window.sessionStorage.getItem( OVERRIDE_KEY ) || '';
	const inited = new Set();
	let observer;
	let timer;
	let contextPromise;
	let mfeReadyPromise;

	const log = ( ...args ) => {
		if ( config.debug ) {
			// eslint-disable-next-line no-console
			console.log( '[bluehost-domain-connect]', ...args );
		}
	};

	const waitForMfe = () => {
		if ( window.BhDomainConnect ) {
			return Promise.resolve( window.BhDomainConnect );
		}
		if ( ! mfeReadyPromise ) {
			mfeReadyPromise = new Promise( ( resolve, reject ) => {
				const started = Date.now();
				const tick = () => {
					if ( window.BhDomainConnect ) {
						resolve( window.BhDomainConnect );
						return;
					}
					if ( Date.now() - started > 60000 ) {
						reject( new Error( 'BhDomainConnect did not load.' ) );
						return;
					}
					window.setTimeout( tick, 50 );
				};
				tick();
			} );
		}
		return mfeReadyPromise;
	};

	const fetchContext = () => {
		if ( ! contextPromise ) {
			contextPromise = window
				.fetch( config.contextUrl, {
					headers: {
						'X-WP-Nonce': config.nonce,
					},
					credentials: 'same-origin',
				} )
				.then( ( response ) => {
					if ( ! response.ok ) {
						throw new Error(
							`Domain connect context failed (${ response.status })`
						);
					}
					return response.json();
				} );
		}
		return contextPromise;
	};

	const isInsideHost = ( node ) =>
		Boolean( node?.closest?.( `[${ ROOT_ATTRIBUTE }]` ) );

	const containsPreview = ( stage ) =>
		Boolean( stage?.querySelector( config.selectors.stageReady ) );

	const findStageTarget = () => {
		const stage = document.querySelector( config.selectors.stage );
		if (
			! stage ||
			stage.classList.contains( 'closed' ) ||
			containsPreview( stage )
		) {
			return null;
		}
		const anchors = [
			...stage.querySelectorAll( config.selectors.stageAnchor ),
		].filter( ( anchor ) => ! isInsideHost( anchor ) );
		return anchors[ 0 ] || null;
	};

	const findVisibleTarget = ( selector ) =>
		[ ...document.querySelectorAll( selector ) ].find(
			( target ) => target.offsetWidth || target.offsetHeight
		);

	const findChatTarget = () => {
		const messages = [
			...document.querySelectorAll( config.selectors.chatMessage ),
		];
		if ( messages.length ) {
			let node = messages[ messages.length - 1 ];
			while (
				node.parentElement &&
				node.parentElement.childElementCount === 1
			) {
				node = node.parentElement;
			}
			if ( node.parentElement ) {
				return node.parentElement;
			}
		}
		return findVisibleTarget( config.selectors.chat );
	};

	const findHeaderTarget = () => findVisibleTarget( config.selectors.header );

	const findPublishTarget = () => {
		const menus = [
			...document.querySelectorAll( config.selectors.publishMenu ),
		];
		return menus.find(
			( menu ) =>
				( menu.offsetWidth || menu.offsetHeight ) &&
				/publish|domain|pubblica|dominio/i.test( menu.textContent )
		);
	};

	const hasGenerationStarted = () =>
		Boolean(
			window.WVC?.isBuiltWithWvc ||
				document.querySelector(
					'.chat__message--user, .edit-phases__card, [data-wvc-build]'
				)
		);

	const getAvailablePlacements = ( ignoreContextGates = false ) => {
		if ( ! ignoreContextGates && ! hasGenerationStarted() ) {
			return [];
		}

		const available = [];
		const stage = document.querySelector( config.selectors.stage );
		if ( findPublishTarget() ) {
			available.push( 'publish' );
		}
		if ( findStageTarget() ) {
			available.push( 'stage' );
		}
		if ( findChatTarget() ) {
			available.push( 'chat' );
		}
		if (
			findHeaderTarget() &&
			( ignoreContextGates || ( stage && containsPreview( stage ) ) )
		) {
			available.push( 'header' );
		}
		return available;
	};

	const getRequestedPlacement = () =>
		String( placementOverride || config.placement || 'auto' ).toLowerCase();

	const getEnabledPlacements = () => {
		const requested = getRequestedPlacement();
		const forced = requested === 'all' || PLACEMENTS.includes( requested );
		const available = getAvailablePlacements( forced );
		if ( requested === 'all' ) {
			return available;
		}
		if ( PLACEMENTS.includes( requested ) ) {
			return available.includes( requested ) ? [ requested ] : [];
		}
		return PLACEMENTS.filter( ( placement ) =>
			available.includes( placement )
		);
	};

	const mountId = ( placement ) => `${ MOUNT_ID_PREFIX }-${ placement }`;

	const removePlacement = ( placement ) => {
		document
			.querySelectorAll( `[${ ROOT_ATTRIBUTE }="${ placement }"]` )
			.forEach( ( root ) => root.remove() );
		inited.delete( placement );
	};

	const removeStaleStageMounts = () => {
		document
			.querySelectorAll( `[${ ROOT_ATTRIBUTE }="stage"]` )
			.forEach( ( root ) => {
				const anchor = root.closest( config.selectors.stageAnchor );
				const stage = root.closest( config.selectors.stage );
				if (
					! anchor ||
					! stage ||
					containsPreview( stage ) ||
					isInsideHost( anchor )
				) {
					root.remove();
					inited.delete( 'stage' );
				}
			} );
	};

	const ensureMountHost = ( placement, target ) => {
		if ( ! target ) {
			return null;
		}
		const selector = `[${ ROOT_ATTRIBUTE }="${ placement }"]`;
		let wrapper = target.querySelector( selector );
		if ( ! wrapper ) {
			wrapper = document.createElement( 'div' );
			wrapper.className = `bh-domain-connect-host bh-domain-connect-host--${ placement }`;
			wrapper.setAttribute( ROOT_ATTRIBUTE, placement );
			const mount = document.createElement( 'div' );
			mount.id = mountId( placement );
			wrapper.appendChild( mount );
		}
		if ( target.lastElementChild !== wrapper ) {
			target.appendChild( wrapper );
		}
		return wrapper.querySelector( `#${ mountId( placement ) }` );
	};

	const mountHeader = ( target ) => {
		if ( ! target ) {
			return;
		}
		let wrapper = target.querySelector( `[${ ROOT_ATTRIBUTE }="header"]` );
		if ( ! wrapper ) {
			wrapper = document.createElement( 'div' );
			wrapper.className =
				'bh-domain-connect-host bh-domain-connect-host--header';
			wrapper.setAttribute( ROOT_ATTRIBUTE, 'header' );
			const mount = document.createElement( 'div' );
			mount.id = mountId( 'header' );
			wrapper.appendChild( mount );
		}
		const anchor =
			target.querySelector( config.selectors.headerAnchor ) ||
			target.firstElementChild;
		if ( anchor && anchor !== wrapper ) {
			if ( anchor.nextElementSibling !== wrapper ) {
				anchor.insertAdjacentElement( 'afterend', wrapper );
			}
		} else if ( wrapper.parentElement !== target ) {
			target.appendChild( wrapper );
		}
		return wrapper.querySelector( `#${ mountId( 'header' ) }` );
	};

	const initPlacement = async ( placement ) => {
		if ( inited.has( placement ) ) {
			return;
		}
		const mount = document.getElementById( mountId( placement ) );
		if ( ! mount ) {
			return;
		}

		try {
			const [ mfe, context ] = await Promise.all( [
				waitForMfe(),
				fetchContext(),
			] );
			await mfe.init( {
				selector: mountId( placement ),
				suggestedName: context.suggestedName,
				accountId: context.accountId,
				userJwt: context.userJwt,
				siteId: context.siteId,
				productInstanceId: context.productInstanceId,
				callbacks: {
					onPurchased: ( domain, order ) => {
						document.dispatchEvent(
							new CustomEvent( 'nfd:tenweb-domain-purchased', {
								detail: { domain, order, placement },
							} )
						);
						log( 'purchased', domain, order?.orderId );
					},
					onDismissed: () => {
						document.dispatchEvent(
							new CustomEvent( 'nfd:tenweb-domain-dismissed', {
								detail: { placement },
							} )
						);
						log( 'dismissed', placement );
					},
				},
			} );
			inited.add( placement );
			log( 'initialized', placement );
		} catch ( error ) {
			log( 'init failed', placement, error );
		}
	};

	const evaluate = () => {
		removeStaleStageMounts();
		const enabled = getEnabledPlacements();
		PLACEMENTS.forEach( ( placement ) => {
			if ( ! enabled.includes( placement ) ) {
				removePlacement( placement );
			}
		} );

		if ( enabled.includes( 'stage' ) ) {
			ensureMountHost( 'stage', findStageTarget() );
			initPlacement( 'stage' );
		}
		if ( enabled.includes( 'chat' ) ) {
			ensureMountHost( 'chat', findChatTarget() );
			initPlacement( 'chat' );
		}
		if ( enabled.includes( 'header' ) ) {
			mountHeader( findHeaderTarget() );
			initPlacement( 'header' );
		}
		if ( enabled.includes( 'publish' ) ) {
			ensureMountHost( 'publish', findPublishTarget() );
			initPlacement( 'publish' );
		}
	};

	const schedule = () => {
		window.clearTimeout( timer );
		timer = window.setTimeout( evaluate, 150 );
	};

	const start = () => {
		evaluate();
		observer = new window.MutationObserver( ( records ) => {
			if (
				records.some(
					( record ) =>
						! record.target.closest?.( `[${ ROOT_ATTRIBUTE }]` )
				)
			) {
				schedule();
			}
		} );
		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'class', 'data-wvc-region', 'data-wvc-stage' ],
		} );
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', start, { once: true } );
	} else {
		start();
	}

	window.BluehostTenWebDomainConnectDebug = {
		evaluate,
		placements: PLACEMENTS,
		getPlacement: getRequestedPlacement,
		listAvailable: () => getAvailablePlacements( true ),
		open: ( placement ) => {
			const api = window.BhDomainConnect;
			if ( api?.open ) {
				api.open();
			}
			log( 'open requested', placement );
		},
		setPlacement: ( placement ) => {
			const next = String( placement || 'auto' ).toLowerCase();
			placementOverride = next === 'auto' ? '' : next;
			if ( placementOverride ) {
				window.sessionStorage.setItem(
					OVERRIDE_KEY,
					placementOverride
				);
			} else {
				window.sessionStorage.removeItem( OVERRIDE_KEY );
			}
			PLACEMENTS.forEach( removePlacement );
			contextPromise = null;
			evaluate();
			return getEnabledPlacements();
		},
	};
}
