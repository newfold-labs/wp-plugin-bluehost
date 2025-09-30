import {
	HomeIcon,
	ShoppingBagIcon,
	AdjustmentsHorizontalIcon,
	BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { ReactComponent as HelpIcon } from '../components/icons/HelpIcon.svg';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { getMarketplaceSubnavRoutes } from '@modules/wp-module-marketplace/components/marketplaceSubnav';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/home';
import Store from '../pages/ecommerce/page';
import Marketplace from '../pages/marketplace';
import Commerce from '../pages/commerce';
import Settings from '../pages/settings';
import Help from '../pages/help';
import Admin from '../pages/admin';

const addPartialMatch = ( prefix, path ) =>
	prefix === path ? `${ prefix }/*` : path;

/**
 * Redirect component for my_plugins_and_tools route.
 * Redirects users to the solutions page with category=all parameter.
 *
 * @return {null} Returns null as this component only handles redirection.
 */
const SolutionsRedirect = () => {
	// Redirect to the solutions page with category=all parameter.
	window.location.href =
		window.NewfoldRuntime.adminUrl +
		'admin.php?page=solutions&category=all';
	return null;
};

/**
 * Redirect component for staging route.
 * Redirects users to the nfd-staging page.
 *
 * @return {null} Returns null as this component only handles redirection.
 */
const StagingRedirect = () => {
	// Redirect to the nfd-staging page.
	window.location.href =
		window.NewfoldRuntime.adminUrl + 'admin.php?page=nfd-staging';
	return null;
};

/**
 * Redirect component for performance route.
 * Redirects users to the nfd-performance page.
 *
 * @return {null} Returns null as this component only handles redirection.
 */
const PerformanceRedirect = () => {
	// Redirect to the nfd-performance page.
	window.location.href =
		window.NewfoldRuntime.adminUrl + 'admin.php?page=nfd-performance';
	return null;
};

/**
 * Redirect component for hosting route.
 * Redirects users to the nfd-hosting page.
 *
 * @return {null} Returns null as this component only handles redirection.
 */
const HostingRedirect = () => {
	// Redirect to the nfd-hosting page.
	window.location.href =
		window.NewfoldRuntime.adminUrl + 'admin.php?page=nfd-hosting';
	return null;
};

export const AppRoutes = () => {
	return (
		<Routes>
			{ routes.map(
				( page ) =>
					true === page.condition && (
						<Route
							end
							key={ page.name }
							path={ addPartialMatch(
								'/marketplace',
								addPartialMatch( '/store', page.name )
							) }
							element={ <page.Component /> }
						/>
					)
			) }
			{ /* Add redirect routes. */ }
			<Route
				path="/my_plugins_and_tools"
				element={ <SolutionsRedirect /> }
			/>
			<Route path="/staging" element={ <StagingRedirect /> } />
			<Route path="/performance" element={ <PerformanceRedirect /> } />
			<Route path="/hosting" element={ <HostingRedirect /> } />
			<Route path="/" element={ <Home /> } />
			<Route
				path="*"
				element={
					<main style={ { padding: '1rem' } }>
						<p>
							{ __(
								"There's nothing here!",
								'wp-plugin-bluehost'
							) }
						</p>
					</main>
				}
			/>
		</Routes>
	);
};

const topRoutePaths = [ '/home', '/commerce', '/marketplace', '/settings' ];
const utilityRoutePaths = [ '/help' ];

export const routes = [
	{
		name: '/home',
		title: __( 'Home', 'wp-plugin-bluehost' ),
		Component: Home,
		Icon: HomeIcon,
		condition: true,
	},
	{
		name: '/store',
		title: __( 'Store', 'wp-plugin-bluehost' ),
		Component: Store,
		Icon: BuildingStorefrontIcon,
		subRoutes: [
			{
				name: '/store/products',
				title: __( 'Products & Services', 'wp-plugin-bluehost' ),
			},
			NewfoldRuntime.hasCapability( 'hasYithExtended' ) ||
			NewfoldRuntime.hasCapability( 'canAccessGlobalCTB' )
				? {
						name: '/store/sales_discounts',
						title: __( 'Sales & Promotions', 'wp-plugin-bluehost' ),
				  }
				: null,
			NewfoldRuntime.hasCapability( 'hasYithExtended' ) &&
			NewfoldRuntime.hasCapability( 'hasEcomdash' )
				? {
						name: '/store/sales_channel',
						title: __( 'Sales Channel', 'wp-plugin-bluehost' ),
				  }
				: null,
			NewfoldRuntime.isWoo
				? {
						name: '/store/payments',
						title: __( 'Payments', 'wp-plugin-bluehost' ),
				  }
				: null,
			{
				name: '/store/details',
				title: __( 'Store Details', 'wp-plugin-bluehost' ),
			},
		].filter( Boolean ),
		condition: true,
	},
	{
		name: '/commerce',
		title: __( 'Commerce', 'wp-plugin-bluehost' ),
		Component: Commerce,
		condition: true,
	},
	{
		name: '/marketplace',
		title: __( 'Marketplace', 'wp-plugin-bluehost' ),
		Component: Marketplace,
		Icon: ShoppingBagIcon,
		subRoutes: await getMarketplaceSubnavRoutes(),
		condition: true,
	},
	{
		name: '/settings',
		title: __( 'Manage WordPress', 'wp-plugin-bluehost' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
	},
	{
		name: '/settings/settings',
		title: __( 'Settings', 'wp-plugin-bluehost' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
	},
	{
		name: '/settings/staging',
		title: __( 'Staging', 'wp-plugin-bluehost' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
	},
	{
		name: '/settings/performance',
		title: __( 'Performance', 'wp-plugin-bluehost' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
	},
	{
		name: '/help',
		title: __( 'Help', 'wp-plugin-bluehost' ),
		Component: Help,
		Icon: HelpIcon,
		condition: true,
		action( e, preventDefault = false ) {
			if (
				NewfoldRuntime.hasCapability( 'canAccessHelpCenter' ) &&
				window.NewfoldFeatures.isEnabled( 'helpCenter' )
			) {
				if ( preventDefault ) {
					e.preventDefault();
				}
				window.newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp();
			}
		},
	},
	{
		name: '/admin',
		title: __( 'Admin', 'wp-plugin-bluehost' ),
		Component: Admin,
		condition: true,
	},
];

export const topRoutes = _filter( routes, ( route ) =>
	topRoutePaths.includes( route.name )
);

export const utilityRoutes = _filter( routes, ( route ) =>
	utilityRoutePaths.includes( route.name )
);

export default AppRoutes;
