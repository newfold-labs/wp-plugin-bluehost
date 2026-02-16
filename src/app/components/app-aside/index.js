import { useEffect } from '@wordpress/element';

const PORTAL_ID = 'nfd-adam-portal';
const PORTAL_NAME = 'adam';

/**
 * App Aside: slot only. Renders the aside wrapper and the Adam portal container,
 * and registers it with NFDPortalRegistry. The Adam module fills the slot.
 *
 * @return {JSX.Element} Aside wrapper with portal div.
 */
export const AppAside = () => {
	useEffect( () => {
		const registry = window.NFDPortalRegistry;
		const el = document.getElementById( PORTAL_ID );
		if ( registry && el ) {
			registry.registerPortal( PORTAL_NAME, el );
		}
		return () => {
			if ( window.NFDPortalRegistry ) {
				window.NFDPortalRegistry.unregisterPortal( PORTAL_NAME );
			}
		};
	}, [] );

	return (
		<div className="wppbh-app-aside" data-test-id="app-aside">
			<div className="wppbh-app-aside-content">
				<div id={ PORTAL_ID } />
			</div>
		</div>
	);
};
