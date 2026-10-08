import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const StagingFeatureSettings = () => (
	<FeatureToggle
		featureKey="staging"
		toggleId="staging-toggle"
		label={ __( 'Staging', 'wp-plugin-bluehost' ) }
		description={ __(
			'The staging feature provides a way to copy a site to test new updates, features or content.',
			'wp-plugin-bluehost'
		) }
		selectors=".wppbh-app-navitem-Staging"
		notices={ {
			enabledTitle: __( 'Staging Enabled', 'wp-plugin-bluehost' ),
			disabledTitle: __( 'Staging Disabled', 'wp-plugin-bluehost' ),
			enabledText: __(
				'You need to reload the page to manage Staging.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'Staging will no longer display.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default StagingFeatureSettings;
