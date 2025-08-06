import { Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Icon } from 'App/images/card-icon-help-resources.svg';

const HelpCard = ( {} ) => {
	const toggleHelp = ( e ) => {
		if (
			typeof window?.newfoldEmbeddedHelp
				?.toggleNFDLaunchedEmbeddedHelp === 'function'
		) {
			e.preventDefault();
			window?.newfoldEmbeddedHelp?.toggleNFDLaunchedEmbeddedHelp();
		}
	};
	return (
		<a
			href={ window.NewfoldRuntime?.linkTracker?.addUtmParams(
				'admin.php?page=bluehost#/help'
			) }
			onClick={ toggleHelp }
			className="nfd-no-underline nfd-card-link"
			data-cy="help-card"
		>
			<Card className="wppbh-help-card nfd-card">
				<Card.Content>
					<div className="nfd-flex nfd-flex-col nfd-gap-4 nfd-items-center nfd-text-center nfd-mt-4">
						<Icon className="nfd-max-w-12" />
					</div>
					<Title size={ 2 } as="h3" className="nfd-mt-8 nfd-mb-4">
						{ __( 'Get Help & Resources', 'wp-plugin-bluehost' ) }
					</Title>
					<p>
						{ __(
							'Get expert help, documentation, and tutorials to make the most of your WordPress site.',
							'wp-plugin-bluehost'
						) }
					</p>
				</Card.Content>
			</Card>
		</a>
	);
};

export default HelpCard;
