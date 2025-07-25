import { useEffect } from '@wordpress/element';
import { Container, Page, Title } from '@newfold/ui-component-library';
import SolutionCard from './SolutionCard';
import ExpertCard from './ExpertCard';
import HelpCard from './HelpCard';
import ProDesignCard from './ProDesignCard';
import ReferralProgramCard from './ReferralProgramCard';
import QuickLinksCard from './QuickLinksCard';

const Home = () => {
	useEffect( () => {
		// run when mounts
		const el = document.getElementById( 'next-steps-slot' );
		if ( el ) {
			window.NFDPortalRegistry.registerPortal( 'next-steps', el );
			// window.dispatchEvent( new CustomEvent( 'plugin:slots-ready' ) );
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'next-steps' );
		};
	}, [] );

	return (
		<Page className="wppbh-home xl:nfd-max-w-screen-lg">
			<div className="nfd-home__title-section">
				<Title className="nfd-mb-1 nfd-font-bold">
					{ __( 'Welcome to Bluehost', 'wp-plugin-bluehost' ) }
				</Title>
				<span className="nfd-text-sm">
					{ __(
						"We're very excited to get started with you!",
						'wp-plugin-bluehost'
					) }
				</span>
			</div>
			<Container className="nfd-max-w-full nfd-p-8">
				<Title className="nfd-mb-1 nfd-font-bold">
					{ __( 'Next Steps', 'wp-plugin-bluehost' ) }
				</Title>
				<div id="next-steps-slot" />
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
