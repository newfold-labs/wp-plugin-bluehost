import './style.css';

const config = window.BluehostTenWebDomainSearch;

if ( config?.apiUrl ) {
	const ROOT_ATTRIBUTE = 'data-bluehost-domain-search';
	const PLACEMENTS = [ 'stage', 'chat', 'header', 'publish' ];
	const OVERRIDE_KEY = 'bluehostTenWebPlacement';
	const SELECTION_KEY = 'bluehostTenWebSelectedDomain';
	const requestedFromUrl = new URLSearchParams( window.location.search ).get(
		'bhDomainPlacement'
	);

	if ( requestedFromUrl ) {
		window.sessionStorage.setItem(
			OVERRIDE_KEY,
			requestedFromUrl.toLowerCase()
		);
	}

	let placementOverride = window.sessionStorage.getItem( OVERRIDE_KEY ) || '';
	const savedSelection = window.sessionStorage.getItem( SELECTION_KEY );
	const state = {
		query: config.seed || '',
		tld: config.tlds?.[ 0 ] || '.com',
		results: [],
		status: savedSelection ? 'selected' : 'idle',
		selected: savedSelection,
		error: '',
		request: null,
	};
	const roots = new Map();
	let observer;
	let timer;
	let initialSearchStarted = false;

	const text = ( key, fallback ) => config.strings?.[ key ] || fallback;
	const log = ( ...args ) => {
		if ( config.debug ) {
			// eslint-disable-next-line no-console
			console.log( '[bluehost-domain-search]', ...args );
		}
	};

	const append = ( parent, children ) => {
		if (
			children === null ||
			children === undefined ||
			children === false
		) {
			return;
		}
		if ( Array.isArray( children ) ) {
			children.forEach( ( child ) => append( parent, child ) );
		} else if (
			typeof children === 'string' ||
			typeof children === 'number'
		) {
			parent.appendChild( document.createTextNode( String( children ) ) );
		} else if ( children?.nodeType ) {
			parent.appendChild( children );
		}
	};

	const element = ( tag, attributes = {}, children = [] ) => {
		const node = document.createElement( tag );
		Object.entries( attributes ).forEach( ( [ key, value ] ) => {
			if ( value === null || value === undefined || value === false ) {
				return;
			}
			if ( key === 'className' ) {
				node.className = value;
			} else if ( key === 'text' ) {
				node.textContent = value;
			} else if (
				key.startsWith( 'on' ) &&
				typeof value === 'function'
			) {
				node.addEventListener( key.slice( 2 ).toLowerCase(), value );
			} else if (
				[ 'disabled', 'checked', 'selected' ].includes( key )
			) {
				node[ key ] = Boolean( value );
			} else {
				node.setAttribute( key, value === true ? '' : String( value ) );
			}
		} );
		append( node, children );
		return node;
	};

	const sanitizeQuery = ( value ) =>
		String( value || '' )
			.toLowerCase()
			.trim()
			.replace( /^https?:\/\//, '' )
			.replace( /\/.*$/, '' )
			.replace( /[^a-z0-9.-]/g, '' );

	const searchQuery = () => {
		const query = sanitizeQuery( state.query );
		return query && ! query.includes( '.' ) ? query + state.tld : query;
	};

	const isAvailable = ( domain ) =>
		domain.available || domain.aftermarket || domain.premium;

	const formatPrice = ( domain ) =>
		domain.priceWithCurrency ||
		( Number.isFinite( domain.price )
			? new Intl.NumberFormat( 'en-US', {
					style: 'currency',
					currency: domain.currency || 'USD',
			  } ).format( domain.price )
			: '' );

	const renderAll = ( stepChanged = false ) => {
		roots.forEach( ( options, root ) => {
			if ( root.isConnected ) {
				renderPanel( root, options, stepChanged );
			}
		} );
		document
			.querySelectorAll( '.bhdc-header-button' )
			.forEach( ( button ) => {
				button.textContent =
					state.selected || text( 'connect', 'Connect domain' );
			} );
	};

	const requestDomains = async ( query, mode = 'search' ) => {
		const url = new URL( config.apiUrl );
		url.searchParams.set( 'query', query );
		url.searchParams.set( 'mode', mode );
		const response = await fetch( url.toString(), {
			headers: { 'X-WP-Nonce': config.nonce },
			credentials: 'same-origin',
			signal: state.request?.signal,
		} );
		// A logged-out session answers with the login page, so the body is only
		// parsed after confirming it is JSON.
		const body = await response.text();
		let payload;
		try {
			payload = JSON.parse( body );
		} catch {
			throw new Error( text( 'error', 'Domain search is unavailable.' ) );
		}
		if ( ! response.ok ) {
			throw new Error(
				payload?.message ||
					text( 'error', 'Domain search is unavailable.' )
			);
		}
		return payload.results || [];
	};

	const search = async () => {
		const query = searchQuery();
		if ( ! query ) {
			document
				.querySelector( `[${ ROOT_ATTRIBUTE }] [data-key="query"]` )
				?.focus();
			return;
		}

		state.request?.abort();
		state.request = new AbortController();
		state.status = 'loading';
		state.error = '';
		renderAll( true );

		try {
			state.results = ( await requestDomains( query ) ).filter(
				isAvailable
			);
			state.status = state.results.length ? 'results' : 'empty';
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				return;
			}
			state.error = error.message;
			state.status = 'error';
		}
		renderAll( true );
	};

	const selectDomain = async ( domain ) => {
		state.request?.abort();
		state.request = new AbortController();
		state.status = 'verifying';
		state.error = '';
		renderAll( true );

		try {
			const results = await requestDomains(
				domain.domainName,
				'availability'
			);
			const verified = results.find(
				( result ) =>
					result.domainName === domain.domainName &&
					isAvailable( result )
			);
			if ( ! verified ) {
				throw new Error( 'Domain is no longer available' );
			}

			state.selected = verified.domainName;
			state.status = 'selected';
			window.sessionStorage.setItem( SELECTION_KEY, verified.domainName );
			document.dispatchEvent(
				new CustomEvent( 'nfd:tenweb-domain-selected', {
					detail: verified,
				} )
			);
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				return;
			}
			state.error = error.message;
			state.status = 'error';
		}
		renderAll( true );
	};

	const heading = ( label ) =>
		element( 'div', {
			className: 'bhdc-heading',
			role: 'heading',
			'aria-level': '2',
			tabindex: '-1',
			text: label,
		} );

	const renderSearchField = ( root ) => {
		const inputId = `${ root.id }-query`;
		const tldId = `${ root.id }-tld`;
		const input = element( 'input', {
			id: inputId,
			className: 'bhdc-input',
			type: 'search',
			autocomplete: 'off',
			spellcheck: 'false',
			placeholder: text( 'placeholder', 'your business name' ),
			value: state.query,
			'data-key': 'query',
			oninput: ( event ) => {
				state.query = event.target.value;
			},
			onkeydown: ( event ) => {
				if ( event.key === 'Enter' ) {
					event.preventDefault();
					search();
				}
			},
		} );
		const select = element(
			'select',
			{
				id: tldId,
				className: 'bhdc-select',
				'aria-label': text( 'extension', 'Domain extension' ),
				'data-key': 'tld',
				onchange: ( event ) => {
					state.tld = event.target.value;
				},
			},
			( config.tlds || [ '.com' ] ).map( ( tld ) =>
				element( 'option', {
					value: tld,
					text: tld,
					selected: tld === state.tld,
				} )
			)
		);

		return element( 'div', { className: 'bhdc-field' }, [
			element( 'label', {
				className: 'bhdc-sr',
				for: inputId,
				text: text( 'title', 'Choose your domain' ),
			} ),
			element( 'div', { className: 'bhdc-box' }, input ),
			select,
			element( 'button', {
				type: 'button',
				className: 'bhdc-button',
				text: text( 'search', 'Search' ),
				'data-key': 'search',
				onclick: search,
			} ),
		] );
	};

	const renderStatus = () => {
		if ( state.status === 'loading' || state.status === 'verifying' ) {
			return element(
				'div',
				{
					className: 'bhdc-searching',
					role: 'status',
					'aria-live': 'polite',
				},
				[
					element( 'span', {
						className: 'bhdc-spinner',
						'aria-hidden': 'true',
					} ),
					element( 'span', {
						text:
							state.status === 'verifying'
								? text( 'checking', 'Checking availability…' )
								: text( 'loading', 'Searching domains…' ),
					} ),
				]
			);
		}
		if ( state.status === 'empty' ) {
			return element( 'div', {
				className: 'bhdc-notice',
				role: 'status',
				text: text(
					'empty',
					'No available domains found. Try another search.'
				),
			} );
		}
		if ( state.status === 'error' ) {
			return element( 'div', {
				className: 'bhdc-notice bhdc-notice--error',
				role: 'alert',
				text:
					state.error ||
					text(
						'error',
						'Domain search is temporarily unavailable. Please try again.'
					),
			} );
		}
		return null;
	};

	const getResultBadge = ( domain, index ) => {
		if ( index === 0 ) {
			return text( 'bestMatch', 'BEST MATCH' );
		}
		if ( domain.premium ) {
			return text( 'premium', 'PREMIUM' );
		}
		if ( domain.aftermarket ) {
			return text( 'aftermarket', 'AFTERMARKET' );
		}
		return text( 'availableShort', 'AVAILABLE' );
	};

	const renderResults = ( limit ) => {
		if ( state.status !== 'results' ) {
			return null;
		}

		return element(
			'div',
			{
				className: 'bhdc-results',
				role: 'list',
				'aria-label': text( 'available', 'Available domains' ),
			},
			state.results.slice( 0, limit ).map( ( domain, index ) => {
				const renewal = domain.renewPriceWithCurrency
					? text( 'renewal', 'then %s/yr' ).replace(
							'%s',
							domain.renewPriceWithCurrency
					  )
					: '';
				const badge = getResultBadge( domain, index );

				return element(
					'div',
					{
						className: `bhdc-result${
							index === 0 ? ' bhdc-result--best' : ''
						}`,
						role: 'listitem',
					},
					[
						element( 'span', {
							className: 'bhdc-domain-name',
							text: domain.domainName,
						} ),
						element( 'span', {
							className: `bhdc-tag${
								index === 0 ? '' : ' bhdc-tag--muted'
							}`,
							text: [ badge, formatPrice( domain ) ]
								.filter( Boolean )
								.join( ' · ' ),
						} ),
						renewal
							? element( 'span', {
									className: 'bhdc-renewal',
									text: renewal,
							  } )
							: null,
						element( 'button', {
							type: 'button',
							className: `bhdc-select-button${
								index === 0 ? '' : ' bhdc-select-button--ghost'
							}`,
							'aria-label': `${ text( 'select', 'Select' ) } ${
								domain.domainName
							}`,
							text: text( 'select', 'Select' ),
							onclick: () => selectDomain( domain ),
						} ),
					]
				);
			} )
		);
	};

	const renderSelected = () =>
		element( 'div', { className: 'bhdc-success', role: 'status' }, [
			element( 'span', {
				className: 'bhdc-success-icon',
				'aria-hidden': 'true',
				text: '✓',
			} ),
			element( 'div', {}, [
				element( 'div', {
					className: 'bhdc-success-title',
					text: state.selected,
				} ),
				element( 'div', {
					className: 'bhdc-subtitle',
					text: text( 'selected', 'Selected' ),
				} ),
			] ),
			element( 'button', {
				type: 'button',
				className: 'bhdc-link',
				text: text( 'change', 'Change' ),
				onclick: () => {
					state.status = state.results.length ? 'results' : 'idle';
					state.selected = '';
					window.sessionStorage.removeItem( SELECTION_KEY );
					renderAll( true );
					if ( state.status === 'idle' ) {
						search();
					}
				},
			} ),
		] );

	function renderPanel( root, options, stepChanged = false ) {
		const active = root.ownerDocument.activeElement;
		const hadFocus = Boolean( active && root.contains( active ) );
		const focusKey = hadFocus ? active.getAttribute?.( 'data-key' ) : null;
		const compact = options.compact;
		const children = [
			element( 'div', { className: 'bhdc-title-row' }, [
				element( 'span', {
					className: 'bhdc-globe',
					'aria-hidden': 'true',
				} ),
				heading(
					compact
						? text( 'title', 'Choose your domain' )
						: text(
								'stageTitle',
								'Choose your domain while we build your site'
						  )
				),
			] ),
			compact
				? null
				: element( 'div', {
						className: 'bhdc-subtitle',
						text: text(
							'description',
							'Choose a suggestion or search for another domain.'
						),
				  } ),
			state.status === 'selected'
				? renderSelected()
				: [
						renderSearchField( root ),
						renderStatus(),
						renderResults( compact ? 3 : 5 ),
				  ],
			element( 'div', {
				className: 'bhdc-fine',
				text: text(
					'disclaimer',
					'Selection does not complete the purchase.'
				),
			} ),
		];
		const step = element(
			'div',
			{
				className: 'bhdc-step',
				'data-step': state.status,
				tabindex: '-1',
			},
			children
		);
		root.replaceChildren( step );
		root.setAttribute( 'data-bhdc-step', state.status );

		if ( hadFocus && stepChanged ) {
			root.querySelector( '.bhdc-heading' )?.focus();
		} else if ( focusKey ) {
			root.querySelector( `[data-key="${ focusKey }"]` )?.focus();
		}
	}

	const createPanel = ( placement, compact = false ) => {
		const root = element( 'section', {
			id: `bluehost-domain-search-${ placement }`,
			className: `bhdc-card bhdc-card--${ placement }${
				compact ? ' bhdc-card--compact' : ''
			}`,
			[ ROOT_ATTRIBUTE ]: placement,
			'aria-label': text( 'title', 'Choose your domain' ),
		} );
		roots.set( root, { compact } );
		renderPanel( root, { compact } );

		if (
			! initialSearchStarted &&
			state.status === 'idle' &&
			state.query
		) {
			initialSearchStarted = true;
			window.setTimeout( search, 0 );
		}
		return root;
	};

	const containsPreview = ( stage ) =>
		Boolean(
			stage.querySelector( config.selectors.stageReady ) ||
				stage.querySelector( 'iframe' )
		);

	const findStageTarget = () => {
		const stage = document.querySelector( config.selectors.stage );
		if (
			! stage ||
			stage.classList.contains( 'closed' ) ||
			containsPreview( stage )
		) {
			return null;
		}
		// This explicit WVC anchor is the stage integration contract. A
		// utility-class fallback can survive beyond the loader and leave the
		// card mounted over the finished preview.
		return stage.querySelector( config.selectors.stageAnchor );
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

	const removePlacement = ( placement ) => {
		document
			.querySelectorAll( `[${ ROOT_ATTRIBUTE }="${ placement }"]` )
			.forEach( ( root ) => {
				root.querySelectorAll( `[${ ROOT_ATTRIBUTE }]` ).forEach(
					( nested ) => roots.delete( nested )
				);
				roots.delete( root );
				root.remove();
			} );
	};

	const mountPanel = ( placement, target, compact = false ) => {
		if ( ! target ) {
			return;
		}
		const mounted = [
			...document.querySelectorAll(
				`[${ ROOT_ATTRIBUTE }="${ placement }"]`
			),
		];
		const root = mounted.shift() || createPanel( placement, compact );
		mounted.forEach( ( duplicate ) => {
			roots.delete( duplicate );
			duplicate.remove();
		} );
		if ( root.parentElement !== target ) {
			target.appendChild( root );
		}
		log( 'mounted', placement );
	};

	const mountHeader = ( target ) => {
		if ( ! target ) {
			return;
		}
		let wrapper = target.querySelector( `[${ ROOT_ATTRIBUTE }="header"]` );
		if ( ! wrapper ) {
			wrapper = element( 'div', {
				className: 'bhdc-header',
				[ ROOT_ATTRIBUTE ]: 'header',
			} );
			const panel = createPanel( 'header-popover', true );
			panel.hidden = true;
			const button = element( 'button', {
				type: 'button',
				className: 'bhdc-header-button',
				text: state.selected || text( 'connect', 'Connect domain' ),
				'aria-expanded': 'false',
				onclick: () => {
					panel.hidden = ! panel.hidden;
					button.setAttribute(
						'aria-expanded',
						String( ! panel.hidden )
					);
				},
			} );
			wrapper.append( button, panel );
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
		log( 'mounted', 'header' );
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
		return [ 'publish', 'stage', 'header', 'chat' ]
			.filter( ( placement ) => available.includes( placement ) )
			.slice( 0, 1 );
	};

	const evaluate = () => {
		const enabled = getEnabledPlacements();
		PLACEMENTS.forEach( ( placement ) => {
			if ( ! enabled.includes( placement ) ) {
				removePlacement( placement );
			}
		} );
		if ( enabled.includes( 'stage' ) ) {
			mountPanel( 'stage', findStageTarget() );
		}
		if ( enabled.includes( 'chat' ) ) {
			mountPanel( 'chat', findChatTarget(), true );
		}
		if ( enabled.includes( 'header' ) ) {
			mountHeader( findHeaderTarget() );
		}
		if ( enabled.includes( 'publish' ) ) {
			mountPanel( 'publish', findPublishTarget(), true );
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

	window.BluehostTenWebDomainSearchDebug = {
		evaluate,
		getState: () => ( { ...state, request: undefined } ),
		stop: () => observer?.disconnect(),
		placements: PLACEMENTS,
		getPlacement: getRequestedPlacement,
		listAvailable: () => getAvailablePlacements( true ),
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
			evaluate();
			return getEnabledPlacements();
		},
	};
}
