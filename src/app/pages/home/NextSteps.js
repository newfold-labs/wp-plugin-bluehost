import { Button, Card, Container, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-icon-explore-solutions.svg';
import { ReactComponent as Arrow } from 'App/images/card-mini-arrow.svg';

const NextSteps = ( {} ) => {
	const steps = [
		{
			title: 'Explore the premium tools included in your solution',
			id: 'explore-solution',
			description:
				'A bundle of features designed to elevate your online experience',
			icon: Icon,
			href: '#',
		},
		{
			title: 'Add your first product',
			id: 'add-product',
			description:
				'Create or import a product and bring your store to life',
			icon: Icon,
			href: '#',
		},
		{
			title: 'Add your store info',
			id: 'store-info',
			description:
				'Build trust and present yourself in the best way to your customers',
			icon: Icon,
			href: '#',
		},
		{
			title: 'Connect a payment processor',
			id: 'payment-processor',
			description:
				'Get ready to receive your first payments via PayPal or credit card',
			icon: Icon,
			href: '#',
		},
		{
			title: 'Configure tax settings',
			id: 'tax-settings',
			description: 'Set up your tax options to start selling',
			icon: Icon,
			href: '#',
		},
		{
			title: 'A compleded step!',
			id: 'completed-step',
			description:
				'A quick way to boost traffic and sales while engaging your audience',
			icon: Icon,
			href: '#',
		},
	];
	return (
		<Container>
			<Container.Block>
				<p className="nfd-pb-6">
					{ __(
						'To get the best experience, we recommend completing these onboarding steps:',
						'wp-plugin-bluehost'
					) }
				</p>
				<div className="nfd-flex nfd-flex-col nfd-gap-4">
					{ steps.map( ( step, index ) => (
						<a
							className={ `nfd-no-underline nfd-card-link nfd-card-link-mini ${ step.id } ` }
							href={ step.href }
							key={ index }
						>
							<Card className="nfd-card nfd-p-4">
								<Card.Content>
									<div className="nfd-flex nfd-flex-row nfd-gap-6 nfd-justify-start nfd-align-middle">
										<step.icon className="nfd-max-w-12" />
										<div className="nfd-flex nfd-flex-col nfd-gap-2 nfd-self-start">
											<Title
												size={ 5 }
												as="p"
												className=""
											>
												{ step.title }
											</Title>
											<p>{ step.description }</p>
										</div>
										<div className="nfd-ml-auto">
											<Button
												className=""
												variant="primary"
											>
												<Arrow className="" />
											</Button>
										</div>
									</div>
								</Card.Content>
							</Card>
						</a>
					) ) }
				</div>
			</Container.Block>
		</Container>
	);
};

export default NextSteps;
