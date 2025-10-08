/**
 * Portal Registry System
 *
 * This registry system enables React-style portals for module-based apps within the main plugin.
 * It allows modules to render their components into designated DOM containers managed by the main app.
 *
 * ## How It Works
 *
 * 1. **Main App Registration**: The main plugin app registers portal containers (DOM elements) with unique names
 * 2. **Portal App Root IDs**: Portal apps need a root id added to the main app's DOM element (see inc/Admin.php lines 172-178)
 * 3. **Module Consumption**: Modules listen for portal readiness and render their components into the registered containers
 * 4. **Lifecycle Management**: Portals are automatically cleaned up when pages unmount
 *
 * ## Usage Examples
 *
 * ### 1. Main App - Registering a Portal Container
 *
 * ```jsx
 * import { useEffect } from '@wordpress/element';
 *
 * const MyPage = () => {
 *   useEffect(() => {
 *     // Register portal container when component mounts
 *     const myPortal = document.getElementById('my-module-portal');
 *     if (myPortal) {
 *       window.NFDPortalRegistry.registerPortal('my-module', myPortal);
 *     }
 *
 *     // Clean up when component unmounts
 *     return () => {
 *       window.NFDPortalRegistry.unregisterPortal('my-module');
 *     };
 *   }, []);
 *
 *   return (
 *     <div>
 *       <h1>My Page</h1>
 *       <div id="my-module-portal" />
 *     </div>
 *   );
 * };
 * ```
 *
 * ### 2. Module - Consuming a Portal
 *
 * ```jsx
 * import { createPortal, useEffect, useState } from '@wordpress/element';
 *
 * export const MyModulePortal = () => {
 *   const [container, setContainer] = useState(null);
 *
 *   useEffect(() => {
 *     const registry = window.NFDPortalRegistry;
 *
 *     // Check for required registry
 *     if (!registry) {
 *       return;
 *     }
 *
 *     const updateContainer = (el) => {
 *       setContainer(el);
 *     };
 *
 *     const clearContainer = () => {
 *       setContainer(null);
 *     };
 *
 *     // Subscribe to portal readiness updates
 *     registry.onReady('my-module', updateContainer);
 *     registry.onRemoved('my-module', clearContainer);
 *
 *     // Immediately try to get the container if already registered
 *     const current = registry.getElement('my-module');
 *     if (current) {
 *       updateContainer(current);
 *     }
 *   }, []);
 *
 *   if (!container) {
 *     return null;
 *   }
 *
 *   return createPortal(
 *     <div className="my-module-content">
 *       <h2>My Module Content</h2>
 *     </div>,
 *     container
 *   );
 * };
 * ```
 *
 * ## API Reference
 *
 * ### registerPortal(name, element)
 * Registers a DOM element as a portal container with the given name.
 * - `name` (string): Unique identifier for the portal
 * - `element` (HTMLElement): DOM element to use as portal container
 *
 * ### unregisterPortal(name)
 * Unregisters a portal container and notifies any listeners.
 * - `name` (string): Portal identifier to unregister
 *
 * ### onReady(name, callback)
 * Registers a callback to be called when a portal becomes ready.
 * - `name` (string): Portal identifier
 * - `callback` (function): Function to call with the portal element
 *
 * ### onRemoved(name, callback)
 * Registers a callback to be called when a portal is removed.
 * - `name` (string): Portal identifier
 * - `callback` (function): Function to call when portal is removed
 *
 * ### isReady(name)
 * Checks if a portal is ready for use.
 * - `name` (string): Portal identifier
 * - Returns: boolean indicating if portal is ready
 *
 * ### getElement(name)
 * Gets the current portal element if available.
 * - `name` (string): Portal identifier
 * - Returns: HTMLElement or null
 *
 * ## Real Examples in Codebase
 *
 * - **Next Steps Module**: `src/app/pages/home/index.js` registers 'next-steps' portal
 * - **Module Consumption**: `vendor/newfold-labs/wp-module-next-steps/src/components/portal/index.js`
 *
 * ## Best Practices
 *
 * 1. **Unique Names**: Use descriptive, unique portal names (e.g., 'next-steps', 'marketplace', 'solutions')
 * 2. **Cleanup**: Always unregister portals in useEffect cleanup to prevent memory leaks
 * 3. **Error Handling**: Check for registry existence before using it
 * 4. **Immediate Check**: Use `getElement()` to check if portal is already available
 * 5. **Consistent Naming**: Use kebab-case for portal names and IDs
 *
 * ## Troubleshooting
 *
 * - **Portal not rendering**: Check that the portal is registered before the module tries to use it
 * - **Memory leaks**: Ensure `unregisterPortal()` is called in useEffect cleanup
 * - **Registry undefined**: Make sure the portal registry is loaded before modules try to use it
 */

/**
 * Portal Registry Implementation
 *
 * A singleton registry that manages React portal containers for module-based apps.
 * Uses a closure pattern to maintain private state and provide a clean public API.
 */
const portalRegistry = ( () => {
	/** @type {Object.<string, {element: HTMLElement, isReady: boolean}>} */
	const portals = {};

	/** @type {Object.<string, Array<Function>>} */
	const listeners = {};

	/** @type {Object.<string, Array<Function>>} */
	const removalListeners = {};

	return {
		/**
		 * Registers a DOM element as a portal container
		 *
		 * @param {string}      name    - Unique identifier for the portal
		 * @param {HTMLElement} element - DOM element to use as portal container
		 * @example
		 * // Register a portal container
		 * const portalElement = document.getElementById('my-portal');
		 * registry.registerPortal('my-module', portalElement);
		 */
		registerPortal( name, element ) {
			portals[ name ] = {
				element,
				isReady: true,
			};

			// Call listeners waiting on this portal
			if ( listeners[ name ] ) {
				listeners[ name ].forEach( ( cb ) => cb( element ) );
			}
		},

		/**
		 * Unregisters a portal container and notifies removal listeners
		 *
		 * @param {string} name - Portal identifier to unregister
		 * @example
		 * // Unregister a portal (typically in useEffect cleanup)
		 * registry.unregisterPortal('my-module');
		 */
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

		/**
		 * Registers a callback to be called when a portal becomes ready
		 *
		 * @param {string}                      name     - Portal identifier
		 * @param {function(HTMLElement): void} callback - Function to call with the portal element
		 * @example
		 * // Listen for portal readiness
		 * registry.onReady('my-module', (element) => {
		 *   setContainer(element);
		 * });
		 */
		onReady( name, callback ) {
			if ( portals[ name ]?.isReady ) {
				callback( portals[ name ].element );
			} else {
				listeners[ name ] = listeners[ name ] || [];
				listeners[ name ].push( callback );
			}
		},

		/**
		 * Registers a callback to be called when a portal is removed
		 *
		 * @param {string}           name     - Portal identifier
		 * @param {function(): void} callback - Function to call when portal is removed
		 * @example
		 * // Listen for portal removal
		 * registry.onRemoved('my-module', () => {
		 *   setContainer(null);
		 * });
		 */
		onRemoved( name, callback ) {
			removalListeners[ name ] = removalListeners[ name ] || [];
			removalListeners[ name ].push( callback );
		},

		/**
		 * Checks if a portal is ready for use
		 *
		 * @param {string} name - Portal identifier
		 * @return {boolean} True if portal is ready, false otherwise
		 * @example
		 * // Check portal status
		 * if (registry.isReady('my-module')) {
		 *   // Portal is available
		 * }
		 */
		isReady( name ) {
			return !! portals[ name ]?.isReady;
		},

		/**
		 * Gets the current portal element if available
		 *
		 * @param {string} name - Portal identifier
		 * @return {HTMLElement|null} Portal element or null if not available
		 * @example
		 * // Get portal element immediately
		 * const element = registry.getElement('my-module');
		 * if (element) {
		 *   setContainer(element);
		 * }
		 */
		getElement( name ) {
			return portals[ name ]?.element || null;
		},
	};
} )();

/**
 * Global window assignment for portal registry
 * Makes the registry available globally as window.NFDPortalRegistry
 * This allows modules to access the registry without importing it
 */
window.NFDPortalRegistry = portalRegistry;

/**
 * Default export of the portal registry
 * Can be imported in ES6 modules: import portalRegistry from './portalRegistry'
 */
export default portalRegistry;
