import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { filter } from 'lodash';
import {
	Button,
	AppBarNavigation,
	useNavigationContext,
} from '@newfold/ui-component-library';
import { default as NewfoldNotifications } from '@modules/wp-module-notifications/assets/js/components/notifications/';
import { useLocation } from 'react-router-dom';
import classnames from 'classnames';
import { getPlatformPathUrl } from 'App/util/helpers';
import { getEditorUrl } from 'App/util/themeUtils';
import { topRoutes, utilityRoutes } from 'App/data/routes';
import {
	RectangleGroupIcon,
	ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import Logo from '../logo';

export const AppNavHeader = () => {
	const { mode } = AppBarNavigation.AppBar.useContext();
	return <Logo variant={ mode === 'inline' ? 'icon' : 'wordmark' } />;
};

export const AppNavMenu = () => {
	const location = useLocation();
	const { setActivePath } = useNavigationContext();

	const menu = () => {
		return (
			<AppBarNavigation.AppBar.Nav>
				{ [ ...topRoutes, ...utilityRoutes ]?.map( ( page ) => {
					if ( true !== page.condition ) {
						return null;
					}

					const { mode, setOpen } =
						AppBarNavigation.AppBar.useContext();
					return (
						<AppBarNavigation.AppBar.Item
							key={ page.name }
							label={ page.title }
							href={ `#${ page.name }` }
							className={ classnames(
								'group-[.nfd-appbar-item--active]:nfd-text-[var(--color-primary)] nfd-whitespace-nowrap',
								{
									'nfd-px-4 group-[.nfd-appbar-item--active]:nfd-bg-[#DBF1FC80] group-[.nfd-appbar-item--active]:nfd-font-bold':
										'inline' === mode,
									'nfd-px-0 nfd-font-bold nfd-bg-transparent group-[.nfd-appbar-item]:!nfd-bg-transparent  hover:!nfd-bg-black':
										'collapsed' === mode,
								}
							) }
							onClick={ ( e ) => {
								// set open to false
								setOpen( false );
								// run any actions assigned to page
								if (
									page.action &&
									page.action instanceof Function
								) {
									page.action( e );
								}
							} }
						/>
					);
				} ) }
			</AppBarNavigation.AppBar.Nav>
		);
	};

	const actions = () => {
		return (
			<>
				<Button
					as={ 'a' }
					className={ 'nfd-flex nfd-gap-2 nfd-mr-4' }
					href={ getEditorUrl( 'edit' ) }
				>
					AI Editor
					<RectangleGroupIcon />
				</Button>
				<Button
					as={ 'a' }
					className={ 'nfd-flex nfd-gap-2 nfd-mr-4' }
					href={ window.NewfoldRuntime.linkTracker.addUtmParams(
						getPlatformPathUrl( 'hosting/details', 'app/#/sites' )
					) }
					variant={ 'secondary' }
				>
					Hosting Panel
					<ArrowUpRightIcon />
				</Button>
			</>
		);
	};

	const SubMenusManager = () => {
		// close any open submenus
		const subMenus = document.querySelectorAll(
			'.wppbh-app-navitem-submenu'
		);
		subMenus.forEach( ( subMenu ) => {
			subMenu.classList.add( 'nfd-hidden' );
		} );

		// open active's submenu if it exists
		const activeMenu = document.querySelector(
			'.wppbh-app-sidenav .active'
		);
		if (
			activeMenu &&
			null !== activeMenu.nextSibling &&
			activeMenu.nextSibling.classList.contains(
				'wppbh-app-navitem-submenu'
			)
		) {
			activeMenu.nextSibling.classList.remove( 'nfd-hidden' );
		}
	};

	useEffect( () => {
		if ( location?.pathname ) {
			setActivePath( `#${ location.pathname }` );
		}
		SubMenusManager();
		document.onclick = SubMenusManager;
	}, [ location ] );

	return (
		<>
			{ menu() }
			<div className={ 'nfd-grow' } />
			{ actions() }
		</>
	);
};

// export const SideNavMenuSubItem = ( { label, path, action } ) => {
// 	return (
// 		<li className="nfd-m-0 nfd-pb-1">
// 			<NavLink
// 				onClick={ action && action instanceof Function ? action : null }
// 				to={ path }
// 				className={ `wppbh-app-subnavitem wppbh-app-subnavitem-${ cleanForSlug(
// 					label
// 				) } nfd-flex nfd-items-center nfd-gap-3 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-body leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0] [&.active]:nfd-text-title` }
// 			>
// 				{ label }
// 			</NavLink>
// 		</li>
// 	);
// };

export const AppBarNav = () => {
	const location = useLocation();
	const hashedPath = '#' + location.pathname;

	return (
		<>
			<AppBarNavigation.AppBar
				position={ 'absolute' }
				className={ 'nfd-pr-2' }
				collapseAt={ 880 }
			>
				<AppNavHeader />
				<AppNavMenu />
			</AppBarNavigation.AppBar>
			<NewfoldNotifications
				constants={ {
					context: 'bluehost-app-nav',
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
		</>
	);
};

export const AppNav = () => {
	return <AppBarNav />;
};
