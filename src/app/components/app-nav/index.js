import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useViewportMatch } from '@wordpress/compose';
import { addQueryArgs, cleanForSlug } from '@wordpress/url';
import { filter } from 'lodash';
import { Modal, AppBarNavigation, useNavigationContext } from '@newfold/ui-component-library';
import { default as NewfoldNotifications } from '@modules/wp-module-notifications/assets/js/components/notifications/';
import { NavLink, useLocation } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { topRoutes, utilityRoutes } from 'App/data/routes';
import { handleHelpLinksClick } from '../../util/helpers';
import Logo from '../logo';

export const AppNavHeader = () => {
	return (
		<AppBarNavigation.Item as={ 'div' }>
			<Logo variant={ 'icon' }/>
		</AppBarNavigation.Item>
	);
};

export const AppNavMenu = () => {
	const location = useLocation();
	const { setActivePath, activePath } = useNavigationContext();

	const primaryMenu = () => {
		return (
			<>
			{ topRoutes?.map(
					( page ) =>
						true === page.condition && (
							<AppBarNavigation.Item
								key={ page.name }
								label={ page.title }
								name={ page.name }
								href={ `#${page.name}` }
								action={ page.action }
								subItems={ page.subRoutes }
							/>
						)
				) }
			</>
		);
	};

	const secondaryMenu = () => {
		return (
			<>
				{ utilityRoutes?.map( ( page ) => (
					<AppBarNavigation.Item
						key={ page.name }
						label={ page.title }
						name={ page.name }
						href={ `#${ page.name }` }
						action={ page.action }
						subItems={ page.subRoutes }
					/>
				) ) }
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
		if(location?.pathname){
			setActivePath( `#${ location.pathname }` );
		}

		SubMenusManager();
		document.onclick = SubMenusManager;
	}, [ location ] );

	return (
		<>
			{ primaryMenu() }
			<div class={'nfd-grow'} />
			{ secondaryMenu() }
		</>
	);
};

export const SideNavMenuSubItem = ( { label, path, action } ) => {
	return (
		<li className="nfd-m-0 nfd-pb-1">
			<NavLink
				onClick={ action && action instanceof Function ? action : null }
				to={ path }
				className={ `wppbh-app-subnavitem wppbh-app-subnavitem-${ cleanForSlug(
					label
				) } nfd-flex nfd-items-center nfd-gap-3 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-body leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0] [&.active]:nfd-text-title` }
			>
				{ label }
			</NavLink>
		</li>
	);
};

export const AppBarNav = () => {
	const location = useLocation();
	const hashedPath = '#' + location.pathname;

	return (
		<>
			<AppBarNavigation.AppBar position={ 'absolute' }>
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
	const isLargeViewport = useViewportMatch( 'medium' );

	// TODO: implement mobile menu
	// return <>{ ( isLargeViewport && <SideNav /> ) || <MobileNav /> }</>;
	return <AppBarNav />;
};
