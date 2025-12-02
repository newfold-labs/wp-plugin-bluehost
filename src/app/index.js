import './stylesheet.scss';
import './tailwind.pcss';

// eslint-disable-next-line import/no-unresolved
import { store as noticesStore } from '@wordpress/notices';
import { useLocation, HashRouter as Router } from 'react-router-dom';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { Root, NavigationProvider } from '@newfold/ui-component-library';
import { SnackbarList, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect } from 'react';
import { kebabCase, filter } from 'lodash';
import AppStore, { AppStoreProvider } from './data/store';
import { AppNav } from './components/app-nav/index';
import AppRoutes from './data/routes';
import ErrorCard from './components/errorCard';
import { useHandlePageLoad } from './util/hooks';
import { NotificationFeed } from './components/notifications';
import { handleHelpLinksClick } from './util/helpers';

// component sourced from module
import { default as NewfoldNotifications } from '@modules/wp-module-notifications/assets/js/components/notifications/';
// to pass to notifications module
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { useState } from '@wordpress/element';

const Notices = () => {
	const notices = useSelect(
		( select ) =>
			select( noticesStore )
				.getNotices()
				.filter( ( notice ) => notice.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( noticesStore );

	return (
		<SnackbarList
			className="edit-site-notices"
			notices={ notices }
			onRemove={ removeNotice }
		/>
	);
};

/**
 * Synchronizes the WordPress admin menu highlighting with the current route.
 *
 * This function handles the menu highlighting by:
 * 1. Removing existing highlight classes from all menu items
 * 2. Finding the correct menu item based on the current path
 * 3. Adding appropriate WordPress admin menu classes
 *
 * @param {string} path - The current route path (e.g., '/home', '/settings')
 */
const syncWordPressMenu = ( path ) => {
	const menuItems = document.querySelectorAll( '#adminmenu a' );

	menuItems.forEach( ( item ) => {
		item.classList.remove( 'current' );

		const parentListItem = item.closest( 'li' );
		if ( parentListItem ) {
			parentListItem.classList.remove( 'current' );
			parentListItem.classList.remove( 'wp-has-current-submenu' );
			parentListItem.classList.remove( 'wp-menu-open' );
		}
	} );

	const normalizePath = ( rawPath ) => {
		if ( ! rawPath ) {
			return '';
		}

		return rawPath.replace( /^#/, '' ).replace( /\/+$/, '' );
	};

	const buildCandidatePaths = ( rawPath ) => {
		const normalized = normalizePath( rawPath );
		if ( ! normalized ) {
			return [];
		}

		const segments = normalized.split( '/' ).filter( Boolean );
		const candidates = [];

		for ( let i = segments.length; i > 0; i-- ) {
			const partial = '/' + segments.slice( 0, i ).join( '/' );
			candidates.push( partial );
		}

		return candidates;
	};

	const baseHref = 'admin.php?page=bluehost#';
	const candidates = buildCandidatePaths( path );

	let currentMenuItem = null;

	for ( const candidate of candidates ) {
		const fullPath = `${ baseHref }${ candidate }`;

		const item =
			document.querySelector( `#adminmenu a[href="${ fullPath }"]` ) ||
			document.querySelector( `#adminmenu a[href^="${ fullPath }"]` );

		if ( item ) {
			currentMenuItem = item;
			break;
		}
	}

	if ( ! currentMenuItem ) {
		currentMenuItem = document.querySelector(
			'#adminmenu a[href="admin.php?page=bluehost"]'
		);
	}

	if ( currentMenuItem ) {
		currentMenuItem.classList.add( 'current' );

		const parentListItem = currentMenuItem.closest( 'li' );
		if ( parentListItem ) {
			parentListItem.classList.add( 'current' );

			const topLevelParent = parentListItem.closest( '.wp-has-submenu' );
			if ( topLevelParent ) {
				topLevelParent.classList.add( 'wp-has-current-submenu' );
				topLevelParent.classList.add( 'wp-menu-open' );
			}
		}
	}
};

const AppBody = ( props ) => {
	const location = useLocation();
	const hashedPath = '#' + location.pathname;
	const { booted, hasError } = useContext( AppStore );

	useHandlePageLoad();
	handleHelpLinksClick();

	// Sync WordPress admin menu highlighting when route changes
	useEffect( () => {
		let pathnameLocation = location.pathname;
		// Map specific sub-paths to their parent for menu highlighting
		switch ( location?.pathname ) {
			case '/settings/performance':
			case '/settings/staging':
			case '/settings/settings':
				pathnameLocation = '/settings';
				break;
		}
		syncWordPressMenu( pathnameLocation );
	}, [ location ] );

	return (
		<main
			id="wppbh-app-rendered"
			className={ classNames(
				'wpadmin-brand-bluehost',
				`wppbh-wp-${ NewfoldRuntime.wpVersion }`,
				`wppbh-page-${ kebabCase( location.pathname ) }`,
				props.className,
				'nfd-w-full nfd-p-4 min-[783px]:nfd-p-0'
			) }
		>
			<NewfoldNotifications
				constants={ {
					context: 'bluehost-plugin',
					page: hashedPath,
				} }
				methods={ {
					apiFetch,
					addQueryArgs,
					filter,
					useState,
					useEffect,
				} }
			/>
			<div className="wppbh-app-body">
				<header>
					<AppNav />
				</header>
				<div className="wppbh-app-body-inner nfd-flex nfd-justify-center">
					<ErrorBoundary FallbackComponent={ <ErrorCard /> }>
						{ hasError && <ErrorCard error={ hasError } /> }
						{ ( true === booted && <AppRoutes /> ) ||
							( ! hasError && <Spinner /> ) }
					</ErrorBoundary>
				</div>
			</div>

			<div className="wppbh-app-snackbar">
				{ 'undefined' !== typeof noticesStore && <Notices /> }
			</div>
		</main>
	);
};

export const App = () => (
	<AppStoreProvider>
		<Root context={ { isRtl: false } }>
			<NotificationFeed>
				<Router>
					<NavigationProvider>
						<div className="wppbh-app-container min-[783px]:nfd-p-8 min-[783px]:nfd-flex nfd-gap-6 nfd-max-w-full xl:nfd-max-w-screen-xl 2xl:nfd-max-w-screen-2xl nfd-my-0 nfd-mx-auto">
							<AppBody />
						</div>
					</NavigationProvider>
				</Router>
			</NotificationFeed>
		</Root>
	</AppStoreProvider>
);

export default App;
