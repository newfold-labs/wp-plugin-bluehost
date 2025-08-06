// Portal Registry
const portalRegistry = ( () => {
	const portals = {};
	const listeners = {};
	const removalListeners = {};

	return {
		registerPortal( name, element ) {
			portals[ name ] = {
				element,
				isReady: true,
			};

			// Call listeners waiting on this portal
			if ( listeners[ name ] ) {
				listeners[ name ].forEach( ( cb ) => cb( element ) );
				delete listeners[ name ];
			}
		},

		unregisterPortal( name ) {
			if ( portals[ name ] ) {
				delete portals[ name ];
			}
			// Notify any onRemoved listeners
			if ( removalListeners[ name ] ) {
				removalListeners[ name ].forEach( ( cb ) => cb() );
				delete removalListeners[ name ];
			}
		},

		onReady( name, callback ) {
			if ( portals[ name ]?.isReady ) {
				callback( portals[ name ].element );
			} else {
				listeners[ name ] = listeners[ name ] || [];
				listeners[ name ].push( callback );
			}
		},

		onRemoved( name, callback ) {
			removalListeners[ name ] = removalListeners[ name ] || [];
			removalListeners[ name ].push( callback );
		},

		isReady( name ) {
			return !! portals[ name ]?.isReady;
		},

		getElement( name ) {
			return portals[ name ]?.element || null;
		},
	};
} )();

window.NFDPortalRegistry = portalRegistry;
export default portalRegistry;
