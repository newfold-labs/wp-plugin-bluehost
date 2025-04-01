import { Container, Page, Title } from '@newfold/ui-component-library';
import WelcomeSection from './welcomeSection';
// import NextSteps from './NextSteps';
import SolutionCard from './SolutionCard';
import ExpertCard from './ExpertCard';
import HelpCard from './HelpCard';
import ProDesignCard from './ProDesignCard';
import ReferralProgramCard from './ReferralProgramCard';
import QuickLinksCard from './QuickLinksCard';

const Home = () => {
	return (
		<Page className="wppbh-home">
			<div className="nfd-page-header nfd-flex nfd-flex-col nfd-gap-y-4 nfd-mb-8">
				<Title>
					{ __( 'Welcome to Bluehost', 'wp-plugin-bluehost' ) }
				</Title>
				<p>
					{ __(
						'We’re very excited to get started with you!',
						'wp-plugin-bluehost'
					) }
				</p>
			</div>
			<Container>
				<WelcomeSection />
			</Container>
			<Container>
				<Container.Block>
					<div className="nfd-grid nfd-gap-6 nfd-grid-cols-1 min-[540px]:nfd-grid-cols-2 min-[960px]:nfd-grid-cols-3">
						<SolutionCard />
						<ExpertCard />
						<HelpCard />
						<ProDesignCard />
						<ReferralProgramCard />
						<QuickLinksCard />
					</div>
				</Container.Block>
			</Container>
		</Page>
	);
};

export default Home;
