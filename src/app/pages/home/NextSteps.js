import { Button, Card, Container, Title } from '@newfold/ui-component-library';
import {
	ArrowLongRightIcon,
	BuildingStorefrontIcon,
	CalculatorIcon,
	CreditCardIcon,
	StarIcon,
	TagIcon,
} from '@heroicons/react/20/solid';

const NextSteps = ( {} ) => {
	const steps = [
		{
			title: 'Explore the premium tools included in your solution',
			id: 'explore-solution',
			description:
				'A bundle of features designed to elevate your online experience',
			icon: StarIcon,
			href: '#',
			status: 'new',
		},
		{
			title: 'Add your first product',
			id: 'add-product',
			description:
				'Create or import a product and bring your store to life',
			icon: TagIcon,
			href: '/wp-admin/post-new.php?post_type=product',
			status: 'new',
		},
		{
			title: 'Add your store info',
			id: 'store-info',
			description:
				'Build trust and present yourself in the best way to your customers',
			icon: BuildingStorefrontIcon,
			href: '#',
			status: 'new',
		},
		{
			title: 'Connect a payment processor',
			id: 'payment-processor',
			description:
				'Get ready to receive your first payments via PayPal or credit card',
			icon: CreditCardIcon,
			href: '#',
			status: 'new',
		},
		{
			title: 'Configure tax settings',
			id: 'tax-settings',
			description: 'Set up your tax options to start selling',
			icon: CalculatorIcon,
			href: '#',
			status: 'new',
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
							href={ window.NewfoldRuntime.linkTracker.addUtmParams(
								step.href
							) }
							key={ index }
						>
							<Card className="nfd-card nfd-p-4">
								<Card.Content>
									<div className="nfd-flex nfd-flex-row nfd-gap-6 nfd-justify-start nfd-align-middle">
										<div className="nfd-card-icon-wrapper nfd-bg-blue-100 nfd-p-2  nfd-rounded-xl">
											<step.icon className="nfd-min-w-8 nfd-max-w-12 nfd-no-stroke" />
										</div>
										<div className="nfd-flex nfd-flex-col nfd-gap-1 nfd-self-start">
											<Title
												size={ 5 }
												as="p"
												className="nfd-strong"
											>
												{ step.title }
											</Title>
											<p>{ step.description }</p>
										</div>
										<div className="nfd-ml-auto nfd-card-hover-cta">
											<Button
												className=""
												variant="primary"
											>
												<ArrowLongRightIcon className="nfd-no-stroke" />
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
