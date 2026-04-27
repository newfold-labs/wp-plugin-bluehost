import { useState, useEffect, useContext } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Container, Page, Title, Button } from '@newfold/ui-component-library';
import { PartyIcon } from 'App/components/icons';
import AppStore from '../../data/store';
import QuickLinks from './quick-links';

const Home = () => {
	const { store } = useContext( AppStore );
	const [ hasStoreInfo, setHasStoreInfo ] = useState(
		!! (
			window?.NFDStoreInfo?.data?.address &&
			window?.NFDStoreInfo?.data?.city
		)
	);

	useEffect( () => {
		// run when mounts
		const nextStepsPortal = document.getElementById( 'next-steps-portal' );
		const comingSoonPortal =
			document.getElementById( 'coming-soon-portal' );
		const lighthouseReportPortal = document.getElementById(
			'lighthouse-report-portal'
		);

		if ( nextStepsPortal ) {
			window.NFDPortalRegistry.registerPortal(
				'next-steps',
				nextStepsPortal
			);
		}

		if ( comingSoonPortal ) {
			window.NFDPortalRegistry.registerPortal(
				'coming-soon',
				comingSoonPortal
			);
		}

		if ( lighthouseReportPortal ) {
			// Consumed by wp-module-insights' `lighthouse-widget` bundle.
			window.NFDPortalRegistry.registerPortal(
				'lighthouse-report',
				lighthouseReportPortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'next-steps' );
			window.NFDPortalRegistry.unregisterPortal( 'coming-soon' );
			window.NFDPortalRegistry.unregisterPortal( 'lighthouse-report' );
		};
	}, [] );

	const siteKind = window.NewfoldRuntime.siteType || 'website';
	/** From settings API: true when Coming Soon is enabled (show “ready”); false when public (show “live”). */
	const isComingSoonEnabled = !! store?.comingSoon;

	const homeTitle = sprintf(
		/* translators: 1: site kind (e.g. “store” or “website”), 2: status (“live” or “ready”). */
		__( 'Congrats, your %1$s is %2$s!', 'wp-plugin-bluehost' ),
		siteKind === 'store'
			? __( 'store', 'wp-plugin-bluehost' )
			: __( 'website', 'wp-plugin-bluehost' ),
		isComingSoonEnabled
			? __( 'ready', 'wp-plugin-bluehost' )
			: __( 'live', 'wp-plugin-bluehost' )
	);

	useEffect( () => {
		// Update hasStoreInfo when storeInfo changes
		const handleStoreInfoChange = () => {
			setHasStoreInfo(
				!! (
					window?.NFDStoreInfo?.data?.address &&
					window?.NFDStoreInfo?.data?.city
				)
			);
		};
		document.addEventListener(
			'nfd-submit-store-info-form',
			handleStoreInfoChange
		);
		return () => {
			document.removeEventListener(
				'nfd-submit-store-info-form',
				handleStoreInfoChange
			);
		};
	}, [] );

	return (
		<Page className="wppbh-home xl:nfd-max-w-screen-lg">
			<div className="nfd-home__title-section nfd-flex nfd-justify-between nfd-items-center">
				<span
					className={
						'nfd-home__title-wrapper nfd-flex nfd-gap-4 nfd-items-center'
					}
				>
					<PartyIcon />
					<Title className="nfd-mb-1 nfd-font-semibold">
						{ homeTitle }
					</Title>
				</span>
				{ siteKind === 'store' && (
					// Store details button only on store sites
					<Button
						as={ 'a' }
						href={ '#' }
						data-store-info-trigger
						variant={ 'secondary' }
					>
						{ hasStoreInfo
							? __( 'Store Details', 'wp-plugin-bluehost' )
							: __( 'Add Store Details', 'wp-plugin-bluehost' ) }
					</Button>
				) }
			</div>

			{ siteKind !== 'store' && (
				// Coming soon portal for blog and corporate sites only
				<Container className="nfd-max-w-full nfd-p-8 nfd-shadow-none nfd-rounded-xl nfd-border nfd-border-[#D5D5D5]">
					<div id="coming-soon-portal" />
				</Container>
			) }

			<Container className="nfd-max-w-full nfd-p-8 nfd-shadow-none nfd-rounded-xl nfd-border nfd-border-[#D5D5D5]">
				<div id="next-steps-portal" />
			</Container>

			{ /* Filled by wp-module-insights' `lighthouse-widget` bundle via NFDPortalRegistry. */ }
			<div id="lighthouse-report-portal" />

			<Container className="nfd-max-w-full nfd-p-0 nfd-shadow-none nfd-bg-transparent nfd-border-0 nfd-mt-4">
				<Title
					as={ 'h2' }
					className={ 'nfd-text-xl nfd-font-semibold nfd-mb-6' }
				>
					{ __( 'Quick links', 'wp-plugin-bluehost' ) }
				</Title>
				<div className="nfd-grid nfd-gap-4 nfd-grid-cols-1 min-[783px]:nfd-gap-6 min-[540px]:nfd-grid-cols-2 min-[960px]:nfd-grid-cols-3">
					<QuickLinks />
				</div>
			</Container>
		</Page>
	);
};

export default Home;
