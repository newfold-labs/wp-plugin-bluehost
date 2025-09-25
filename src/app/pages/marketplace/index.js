import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Page } from '@newfold/ui-component-library';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
// component sourced from marketplace module
import { default as NewfoldMarketplace } from '@modules/wp-module-marketplace/components/';

const MarketplacePage = () => {

	useEffect( () => {
		// run when mounts
		const marketplacePortal = document.getElementById( 'marketplace-portal' );
		
		if ( marketplacePortal ) {
			window.NFDPortalRegistry.registerPortal(
				'marketplace',
				marketplacePortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'marketplace' );
		};
	}, [] );

	// constants to pass to module
	const moduleConstants = {
		supportsCTB: true,
		text: {
			title: __( 'Marketplace', 'wp-plugin-bluehost' ),
			subTitle: __(
				'Explore our featured collection of tools and services.',
				'wp-plugin-bluehost'
			),
			error: __(
				'Oops, there was an error loading the marketplace, please try again later.',
				'wp-plugin-bluehost'
			),
			noProducts: __(
				'Sorry, no marketplace items. Please, try again later.',
				'wp-plugin-bluehost'
			),
			loadMore: __( 'Load More', 'wp-plugin-bluehost' ),
			productPage: {
				error: {
					title: __(
						'Oops! Something Went Wrong',
						'wp-plugin-bluehost'
					),
					description: __(
						'An error occurred while loading the content. Please try again later.',
						'wp-plugin-bluehost'
					),
				},
			},
		},
	};

	// methods to pass to module
	const moduleMethods = {
		apiFetch,
		classNames,
		useState,
		useEffect,
		useLocation,
		useMatch,
		useNavigate,
		NewfoldRuntime,
	};

	return (
		<Page className={ 'wppbh-app-marketplace-page' }>
			<NewfoldMarketplace constants={ moduleConstants } methods={ moduleMethods } />
		</Page>
	);
};

export default MarketplacePage;
