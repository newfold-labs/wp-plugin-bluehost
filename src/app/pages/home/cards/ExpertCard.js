import { Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-icon-hire-experts.svg';

const ExpertCard = ( {} ) => {
	return (
		<a
			href={ window.NewfoldRuntime.linkTracker.addUtmParams(
				'https://www.bluehost.com/solutions/website-design'
			) }
			className="nfd-no-underline nfd-card-link"
			data-cy="expert-card"
		>
			<Card className="wppbh-solution-card nfd-card">
				<Card.Content>
					<div className="nfd-flex nfd-flex-col nfd-gap-4 nfd-items-center nfd-text-center nfd-mt-4">
						<Icon className="nfd-max-w-12" />
					</div>
					<Title size={ 2 } as="h3" className="nfd-mt-8 nfd-mb-4">
						{ __( 'Hire our experts', 'wp-plugin-bluehost' ) }
					</Title>
					<p>
						{ __(
							'Get in touch with us, and we’ll help you build the exact store you’re dreaming of.',
							'wp-plugin-bluehost'
						) }
					</p>
				</Card.Content>
			</Card>
		</a>
	);
};

export default ExpertCard;
