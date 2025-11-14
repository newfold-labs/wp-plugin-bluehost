import { Button, Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-bg-referral-program.svg';
import { addUtmParams } from 'App/util/helpers';

const ReferralProgramCard = ( {} ) => {
	return (
		<a
			className="nfd-no-underline nfd-card-link"
			href={ addUtmParams(
				'https://www.bluehost.com/affiliates'
			) }
			target="_blank"
			rel="noreferrer"
			data-cy="referral-program-card"
		>
			<Card className="wppbh-help-card nfd-card nfd-card-dark nfd-card-has-bg nfd-min-h-[200px]">
				<Card.Content>
					<Icon className="nfd-bg-img" />
					<div className="nfd-flex nfd-flex-col nfd-gap-4">
						<Title size={ 2 } as="h3">
							{ __(
								'Refer a friend and earn money',
								'wp-plugin-bluehost'
							) }
						</Title>
						<p>
							{ __(
								'Unlock exclusive benefits with our referral program!',
								'wp-plugin-bluehost'
							) }
						</p>
						<div className="nfd-card-bottom nfd-pt-28">
							<Button className="nfd-mt-4" variant="primary">
								{ __( 'Start now', 'wp-plugin-bluehost' ) }
							</Button>
						</div>
					</div>
				</Card.Content>
			</Card>
		</a>
	);
};

export default ReferralProgramCard;
