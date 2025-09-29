import { useEffect } from '@wordpress/element';
import { Container, Page, Title, Button } from '@newfold/ui-component-library';
import QuickLinks from './quick-links';
import { sprintf, __ } from '@wordpress/i18n';

import { PartyIcon } from 'App/components/icons';

const Home = () => {
	useEffect( () => {
		// run when mounts
		const nextStepsPortal = document.getElementById( 'next-steps-portal' );
		if ( nextStepsPortal ) {
			window.NFDPortalRegistry.registerPortal(
				'next-steps',
				nextStepsPortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'next-steps' );
		};
	}, [] );
	// TODO: retrieve dynamically the store kind.
	const siteKind = 'store';

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
						{ sprintf(
							__(
								'Congrats, your %s is live!',
								'wp-plugin-bluehost'
							),
							siteKind
						) }
					</Title>
				</span>
				<Button variant={ 'secondary' } as={ 'a' } href={ '#' }>
					{ __( 'Add Store Details', 'wp-plugin-bluehost' ) }
				</Button>
			</div>

			<Container className="nfd-max-w-full nfd-p-8 nfd-shadow-none nfd-rounded-xl nfd-border nfd-border-[#D5D5D5]">
				<div id="next-steps-portal" />
			</Container>

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
