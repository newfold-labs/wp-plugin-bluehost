import { Container, Page, Title } from '@newfold/ui-component-library';
import WelcomeSection from './welcomeSection';
import SolutionCard from './SolutionCard';
import ExpertCard from './ExpertCard';
import HelpCard from './HelpCard';
import ProDesignCard from './ProDesignCard';
import ReferralProgramCard from './ReferralProgramCard';
import QuickLinksCard from './QuickLinksCard';
import WelcomeBanner from './WelcomeBanner';

const Home = () => {
	return (
		<Page className="wppbh-home xl:nfd-max-w-screen-xl">
		<Container className="nfd-max-w-full">
				<WelcomeBanner />
			</Container>	
			<Container className="nfd-max-w-full">
				<WelcomeSection />
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
