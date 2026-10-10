import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const TenWebDomainConnectSettings = () => (
	<FeatureToggle
		featureKey="tenwebDomainConnect"
		toggleId="tenweb-domain-connect-toggle"
		label={ __( '10Web Domain Connect', 'wp-plugin-bluehost' ) }
		description={ __(
			'Loads the Bluehost domain-connect MFE in the WVC editor.',
			'wp-plugin-bluehost'
		) }
		notices={ {
			enabledTitle: __(
				'10Web Domain Connect Enabled',
				'wp-plugin-bluehost'
			),
			disabledTitle: __(
				'10Web Domain Connect Disabled',
				'wp-plugin-bluehost'
			),
			enabledText: __(
				'Domain connect will load in the WVC editor after a page reload.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'Domain connect will no longer load in the WVC editor.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default TenWebDomainConnectSettings;
