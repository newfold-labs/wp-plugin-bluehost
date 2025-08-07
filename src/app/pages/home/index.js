import { useEffect } from '@wordpress/element';
import { Container, Page, Title, Button } from '@newfold/ui-component-library';
import SolutionCard from './SolutionCard';
import ExpertCard from './ExpertCard';
import HelpCard from './HelpCard';
import ProDesignCard from './ProDesignCard';
import ReferralProgramCard from './ReferralProgramCard';
import QuickLinksCard from './QuickLinksCard';
import { PartyIcon } from 'App/components/icons';

const Home = () => {
	useEffect( () => {
		// run when mounts
		const nextStepsPortal = document.getElementById( 'next-steps-portal' );
		const comingSoonPortal =
			document.getElementById( 'coming-soon-portal' );
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

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'next-steps' );
			window.NFDPortalRegistry.unregisterPortal( 'coming-soon' );
		};
	}, [] );
	// TODO: retrieve dynamically the store kind.
	const siteKind = 'store';

	return (
		<Page className="wppbh-home xl:nfd-max-w-screen-lg">
			<div className="nfd-home__title-section nfd-flex nfd-justify-between nfd-items-center">
				<span className={'nfd-home__title-wrapper nfd-flex nfd-gap-4 nfd-items-center'}>
					<PartyIcon />
					<Title className="nfd-mb-1 nfd-font-semibold">
						{ sprintf( __( 'Congrats, your %s is live!', 'wp-plugin-bluehost' ), siteKind ) }
					</Title>
				</span>
				<Button variant={ 'secondary' } as={ 'a' } href={ '#' }>
					{ __( 'Add Store Details', 'wp-plugin-bluehost' ) }
				</Button>
			</div>
			<Container className="nfd-max-w-full nfd-p-8">
				<div id="next-steps-portal" />
			</Container>
			<div className="nfd-grid nfd-gap-4 nfd-grid-cols-1 min-[783px]:nfd-gap-6 min-[540px]:nfd-grid-cols-2 min-[960px]:nfd-grid-cols-3">
				<SolutionCard />
				<ExpertCard />
				<HelpCard />
				<ProDesignCard />
				<ReferralProgramCard />
				<QuickLinksCard />
			</div>
		</Page>
	);
};

export default Home;
