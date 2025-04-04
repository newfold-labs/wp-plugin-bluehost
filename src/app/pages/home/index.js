import { Container, Page } from '@newfold/ui-component-library';
import WelcomeSection from './welcomeSection';
import SolutionCard from './SolutionCard';
import ExpertCard from './ExpertCard';
import HelpCard from './HelpCard';
import ProDesignCard from './ProDesignCard';
import ReferralProgramCard from './ReferralProgramCard';
import QuickLinksCard from './QuickLinksCard';

const Home = () => {
	return (
		<Page className="wppbh-home">
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
