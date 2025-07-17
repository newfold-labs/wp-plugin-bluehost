import { Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-icon-explore-solutions.svg';

const SolutionCard = ( {} ) => {
	return (
		<a
			href="admin.php?page=solutions"
			className="nfd-no-underline nfd-card-link"
			data-cy="solution-card"
		>
			<Card className="wppbh-solution-card nfd-card">
				<Card.Content>
					<div className="nfd-flex nfd-flex-col nfd-gap-4 nfd-items-center nfd-text-center nfd-mt-4">
						<Icon className="nfd-max-w-12" />
					</div>
					<Title size={ 2 } as="h2" className="nfd-mt-8 nfd-mb-4">
						{ __( 'Explore Premium Tools', 'wp-plugin-bluehost' ) }
					</Title>
					<p>
						{ __(
							'Discover all the features to grow your store, boost sales and loyalize your customers.',
							'wp-plugin-bluehost'
						) }
					</p>
				</Card.Content>
			</Card>
		</a>
	);
};

export default SolutionCard;
