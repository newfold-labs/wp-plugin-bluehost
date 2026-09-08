import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const PerformanceFeatureSettings = () => (
	<FeatureToggle
		featureKey="performance"
		toggleId="performance-toggle"
		label={ __( 'Performance', 'wp-plugin-bluehost' ) }
		description={ __(
			'The performance feature provides improvements to loads faster for visitors including cache settings.',
			'wp-plugin-bluehost'
		) }
		selectors=".wppbh-app-navitem-Performance"
		notices={ {
			enabledTitle: __( 'Performance Enabled', 'wp-plugin-bluehost' ),
			disabledTitle: __( 'Performance Disabled', 'wp-plugin-bluehost' ),
			enabledText: __(
				'You need to reload the page to manage Performance.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'Performance will no longer display.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default PerformanceFeatureSettings;
