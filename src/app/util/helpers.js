import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { dispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

let lastNoticeId;

/**
 * Wrapper method to dispatch snackbar notice
 *
 * @param {string} text text for notice
 */
export const dispatchUpdateSnackbar = ( text = 'Settings Saved' ) => {
	//clear previous notice so they don't stack up when quickly saving multiple settings
	dispatch( 'core/notices' ).removeNotice( lastNoticeId );

	//make new
	dispatch( 'core/notices' )
		.createNotice( 'info', text, {
			type: 'snackbar',
			isDismissible: true,
		} )
		.then( ( result ) => {
			// save as notice to dismiss later
			lastNoticeId = result.notice.id;
		} );
};

/**
 * Wrapper method to post setting to bluehost endpoint
 *
 * @param {Object}   data         object of data
 * @param {Function} passError    setter for the error in component
 * @param {Function} thenCallback method to call in promise then
 */
export const bluehostSettingsApiFetch = ( data, passError, thenCallback ) => {
	return apiFetch( {
		// path: 'bluehost/v1/settings', //  can't use path bacause it breaks on temp domains
		url: NewfoldRuntime.createApiUrl( '/bluehost/v1/settings' ),
		method: 'POST',
		data,
	} )
		.then( ( response ) => {
			thenCallback( response );
		} )
		.catch( ( error ) => {
			passError( error );
		} );
};

/**
 * Wrapper method for toggling a feature via the features API
 *
 * @param {string}   featureName  the name of the feature
 * @param {Function} thenCallback method to call in promise then
 * @return {Promise} Features API promise with attached then callback
 */
export const featureToggle = async ( featureName, thenCallback ) => {
	if ( true === window.NewfoldFeatures.features[ featureName ] ) {
		return window.NewfoldFeatures.disable( featureName ).then(
			( response ) => {
				thenCallback( response );
			}
		);
	}
	// else
	return window.NewfoldFeatures.enable( featureName ).then( ( response ) => {
		thenCallback( response );
	} );
};

/**
 * Helper to update UI elements as features are enabled/disabled
 *
 * @param {string}  selector    css selector to find the element
 * @param {boolean} enabled     whether the element is now activated/deactivated
 * @param {string}  className   the css class to add/remove - default 'nfd-disabled'
 * @param {boolean} forceReload whether this update requires a forced page reload - default false
 */
export const updateUI = (
	selector,
	enabled = true,
	className = 'nfd-disabled',
	forceReload = false
) => {
	const element = document.querySelector( selector );
	if ( element ) {
		if ( ! enabled ) {
			element.classList.add( className );
		} else {
			element.classList.remove( className );
		}
	}
	if ( forceReload ) {
		window.location.reload();
	}
};

/**
 * Wrapper method to post request to bluehost cache endpoint
 *
 * @param {Object}   data         object of data
 * @param {Function} passError    setter for the error in component
 * @param {Function} thenCallback method to call in promise then
 * @return {Promise} apiFetch promise with attached then and catch callbacks
 */
export const bluehostPurgeCacheApiFetch = async (
	data,
	passError,
	thenCallback
) => {
	return apiFetch( {
		url: NewfoldRuntime.createApiUrl( '/bluehost/v1/caching' ),
		method: 'DELETE',
		data,
	} )
		.then( ( response ) => {
			thenCallback( response );
		} )
		.catch( ( error ) => {
			passError( error );
		} );
};

/**
 * Coming soon admin bar
 * @param {boolean} comingSoon Whether or not the site is coming soon.
 */
export const comingSoonAdminbarToggle = ( comingSoon ) => {
	window.NewfoldRuntime.comingSoon.toggleAdminBarSiteStatus( comingSoon );
};

/**
 * Decorates an external link URL with UTM params.
 *
 * The utm_term, if passed, should be the link anchor text.
 * The utm_content should be the unique identifier for the link.
 * The utm_campaign is optional and reserved for special occasions.
 *
 * @param {string} url    The original URL.
 * @param {Object} params The URL parameters to add.
 *
 * @return {string} The new URL.
 */
export const addUtmParams = ( url, params = {} ) => {
	if (
		'object' === typeof window.NewfoldRuntime &&
		'object' === typeof window.NewfoldRuntime.linkTracker &&
		'function' === typeof window.NewfoldRuntime.linkTracker.addUtmParams
	) {
		return window.NewfoldRuntime.linkTracker.addUtmParams( url, params );
	}
	params.utm_source = `wp-admin/admin.php?page=bluehost${ window.location.hash }`;
	params.utm_medium = 'bluehost_plugin';
	return addQueryArgs( url, params );
};

/**
 * Get's Base Platform URL
 * @param {string} path The path to a resource within the platform, leave blank for root.
 *
 * @return {string} The base URL for the platform.
 */
export const getPlatformBaseUrl = ( path = '' ) => {
	const brand = NewfoldRuntime.plugin.brand;

	const baseUrl = () => {
		if ( brand === 'Bluehost_India' ) {
			return 'https://my.bluehost.in';
		}

		if ( isJarvis() ) {
			return 'https://www.bluehost.com';
		}

		return 'https://my.bluehost.com';
	};

	return baseUrl() + path;
};

/**
 * Gets Platform URL
 *
 * @param {string} jarvisPath The path to the hosting resource for Jarvis accounts, leave blank for the main page.
 * @param {string} legacyPath The path to the hosting resource for Legacy accounts, leave blank for the main page.
 *
 * @return {string} The URL for the platform.
 *
 * @example
 * getPlatformPathUrl('home', 'app#home')
 * // returns https://www.bluehost.com/my-account/home if Jarvis or https://my.bluehost.com/hosting/app#home if legacy
 */
export const getPlatformPathUrl = ( jarvisPath = '', legacyPath = '' ) => {
	if ( isJarvis() ) {
		return getPlatformBaseUrl( '/my-account/' ) + jarvisPath;
	}

	return getPlatformBaseUrl( '/hosting/' ) + legacyPath;
};

/**
 * Handles help center links click, will open help center slide if user has access
 * or navigate to help page if user doesn't have access
 */
export const handleHelpLinksClick = () => {
	if (
		NewfoldRuntime.hasCapability( 'canAccessHelpCenter' ) &&
		window.newfoldEmbeddedHelp &&
		! window.newfoldEmbeddedHelp.hasListeners
	) {
		const helpLinks = document.querySelectorAll( '[href*="#/help"]' );
		if ( helpLinks ) {
			helpLinks.forEach( ( el ) =>
				el.addEventListener( 'click', ( e ) => {
					// Prevent default only if the link is not part of a wp-submenu
					const parentMenu = el.closest( '.wp-submenu' );
					if (
						! parentMenu ||
						! parentMenu.classList.contains( 'wp-submenu-wrap' )
					) {
						e.preventDefault();
					}
					window.newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp();
				} )
			);
			window.newfoldEmbeddedHelp.hasListeners = true;
		}
	}
};

/**
 * Check if this is a jarvis site or not.
 * Defaults to true in cases where the capabilites are not set such as
 * in local and test environments that do not receive capabilities.
 *
 * @return {boolean} Whether or not this is a jarvis site.
 */
export const isJarvis = () => {
	if ( window.NewfoldRuntime.capabilities.hasOwnProperty( 'isJarvis' ) ) {
		return NewfoldRuntime.hasCapability( 'isJarvis' );
	}
	return true;
};

/**
 * Cached runtime promise - ensures only one polling instance exists
 * @type {Promise<object>|null}
 */
let runtimePromise = null;

/**
 * Cached features promise - ensures only one polling instance exists
 * @type {Promise<object>|null}
 */
let featuresPromise = null;

/**
 * Wait for the NewfoldRuntime object to be available on window
 * Uses a cached promise to prevent duplicate polling and errors
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @return {Promise<object>} Resolves with the runtime object when available
 */
export const waitForRuntime = ( timeout = 5000 ) => {
	// Return cached promise if already in progress or resolved
	if ( runtimePromise ) {
		return runtimePromise;
	}

	runtimePromise = new Promise( ( resolve, reject ) => {
		// If already available, resolve immediately
		if (
			window.NewfoldRuntime?.adminUrl &&
			window.NewfoldRuntime?.capabilities &&
			window.NewfoldRuntime?.wordpress
		) {
			resolve( window.NewfoldRuntime );
			return;
		}

		const startTime = Date.now();
		const interval = setInterval( () => {
			if (
				window.NewfoldRuntime?.adminUrl &&
				window.NewfoldRuntime?.capabilities &&
				window.NewfoldRuntime?.wordpress
			) {
				clearInterval( interval );
				resolve( window.NewfoldRuntime );
			} else if ( Date.now() - startTime >= timeout ) {
				clearInterval( interval );
				// Clear cached promise on failure so retry is possible
				runtimePromise = null;
				reject(
					new Error(
						'NewfoldRuntime not available, please refresh the page and try again.'
					)
				);
			}
		}, 50 );
	} );

	return runtimePromise;
};

/**
 * Wait for the NewfoldFeatures object to be available on window
 * Uses a cached promise to prevent duplicate polling and errors
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @return {Promise<object>} Resolves with the features object when available
 */
export const waitForFeatures = ( timeout = 5000 ) => {
	// Return cached promise if already in progress or resolved
	if ( featuresPromise ) {
		return featuresPromise;
	}

	featuresPromise = new Promise( ( resolve, reject ) => {
		// If already available, resolve immediately
		if ( window.NewfoldFeatures?.features ) {
			resolve( window.NewfoldFeatures );
			return;
		}

		const startTime = Date.now();
		const interval = setInterval( () => {
			if ( window.NewfoldFeatures?.features ) {
				clearInterval( interval );
				resolve( window.NewfoldFeatures );
			} else if ( Date.now() - startTime >= timeout ) {
				clearInterval( interval );
				// Clear cached promise on failure so retry is possible
				featuresPromise = null;
				reject(
					new Error(
						'NewfoldFeatures not available, please refresh the page and try again.'
					)
				);
			}
		}, 50 );
	} );

	return featuresPromise;
};

/**
 * Get the appropriate editor URL based on the current theme type
 * @param {string} canvas - Optional canvas parameter for site editor (default: 'edit')
 * @return {Promise<string>} The appropriate editor URL
 */
export const getEditorUrl = async ( canvas = 'edit' ) => {
	// wait for runtime to be ready
	const runtime = await waitForRuntime();
	const classicThemeEditorUrl = `${ runtime.adminUrl }customize.php`;
	const blockThemeEditorUrl = `${ runtime.adminUrl }site-editor.php?canvas=${ canvas }`;
	const aiEditorChatUrl = `&referrer=nfd-editor-chat`;
	const hasBluMVPCapability = runtime.capabilities?.hasBluMVP || false;
	const blockTheme = runtime?.wordpress?.isBlockTheme || false;

	// If the theme is a block theme and the user has the Blu MVP capability
	if ( blockTheme && hasBluMVPCapability ) {
		// return the block theme editor URL with the AI editor chat URL
		return blockThemeEditorUrl + aiEditorChatUrl;
	}
	// If the theme is a block theme and the user does not have the Blu MVP capability
	if ( blockTheme && ! hasBluMVPCapability ) {
		// return the block theme editor URL
		return blockThemeEditorUrl;
	}

	// Classic theme fallback, return the classic theme editor URL
	return classicThemeEditorUrl;
};

/**
 * Get the appropriate editor label based on the current theme type
 * @return {Promise<string>} The appropriate editor label
 */
export const getEditorLabel = async () => {
	const runtime = await waitForRuntime();
	const blockTheme = ( await runtime?.wordpress?.isBlockTheme ) || false;
	const hasBluMVPCapability = runtime.capabilities?.hasBluMVP || false;
	// If the theme is a block theme and the user has the Blu MVP capability, return 'AI Editor'
	if ( blockTheme && hasBluMVPCapability ) {
		return 'AI Editor';
	}
	// If the theme is a block theme and the user does not have the Blu MVP capability, return 'Site Editor'
	if ( blockTheme && ! hasBluMVPCapability ) {
		return 'Site Editor';
	}

	// Classic theme fallback, return 'Customizer'
	return 'Customizer';
};
