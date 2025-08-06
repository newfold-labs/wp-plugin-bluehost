import { Button, Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-bg-pro-design.svg';

const ProDesignCard = ( {} ) => {
	return (
		<a
			className="nfd-no-underline nfd-card-link"
			data-action="load-nfd-ctb"
			data-ctb-id="838cc912-adb3-4d75-9450-262bf3ee3576"
			href={ window.NewfoldRuntime.linkTracker.addUtmParams(
				'https://www.bluehost.com/my-account/market-place'
			) }
			rel="noreferrer"
			target="_blank"
			data-cy="pro-design-card"
		>
			<Card className="wppbh-help-card nfd-card nfd-card-mid nfd-card-has-bg nfd-min-h-[200px]">
				<Card.Content>
					<Icon className="nfd-bg-img" />
					<div className="nfd-flex nfd-flex-col nfd-gap-4">
						<Title size={ 2 } as="h3">
							{ __( 'Pro Design Live', 'wp-plugin-bluehost' ) }
						</Title>
						<p>
							{ __(
								'We will help you build and grow your website and improve your skills in WordPress.',
								'wp-plugin-bluehost'
							) }
						</p>
						<div className="nfd-card-bottom nfd-pt-28">
							<Button className="nfd-mt-4" variant="primary">
								{ __( 'Get Info', 'wp-plugin-bluehost' ) }
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card>
		</a>
	);
};

export default ProDesignCard;
