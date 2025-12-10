/**
 * Utility functions for WordPress theme detection
 */

/**
 * Cached runtime promise - ensures only one polling instance exists
 * @type {Promise<object>|null}
 */
let runtimePromise = null;

/**
 * Wait for the NewfoldRuntime object to be available on window
 * Uses a cached promise to prevent duplicate polling and errors
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @return {Promise<object>} Resolves with the runtime object when available
 */
const waitForRuntime = ( timeout = 5000 ) => {
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
				reject( new Error( 'NewfoldRuntime not available, please refresh the page and try again.' ) );
			}
		}, 50 );
	} );

	return runtimePromise;
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
	const blockThemeEditorUrl   = `${ runtime.adminUrl }site-editor.php?canvas=${ canvas }`;
	const aiEditorChatUrl       = `&referrer=nfd-editor-chat`;
	const hasBluMVPCapability   = runtime.capabilities?.hasBluMVP || false;
	const blockTheme            = runtime?.wordpress?.isBlockTheme || false;

	// If the theme is a block theme and the user has the Blu MVP capability
	if ( blockTheme && hasBluMVPCapability ) {
		// return the block theme editor URL with the AI editor chat URL
		return blockThemeEditorUrl + aiEditorChatUrl;
	}
	// If the theme is a block theme and the user does not have the Blu MVP capability
	if ( blockTheme && !hasBluMVPCapability ) {
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
	const runtime             = await waitForRuntime();
	const blockTheme          = await runtime?.wordpress?.isBlockTheme || false;
	const hasBluMVPCapability = runtime.capabilities?.hasBluMVP || false;
	// If the theme is a block theme and the user has the Blu MVP capability, return 'AI Editor'
	if ( blockTheme && hasBluMVPCapability ) {
		return 'AI Editor';
	}
	// If the theme is a block theme and the user does not have the Blu MVP capability, return 'Site Editor'
	if ( blockTheme && !hasBluMVPCapability ) {
		return 'Site Editor';
	}

	// Classic theme fallback, return 'Customizer'
	return 'Customizer';
};
