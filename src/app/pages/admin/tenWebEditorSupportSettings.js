import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const TenWebEditorSupportSettings = () => (
	<FeatureToggle
		featureKey="tenwebEditorSupport"
		toggleId="tenweb-editor-support-toggle"
		label={ __( '10Web Editor Support', 'wp-plugin-bluehost' ) }
		description={ __(
			'Loads PostHog session replay on the WVC editor admin screen.',
			'wp-plugin-bluehost'
		) }
		notices={ {
			enabledTitle: __(
				'10Web Editor Support Enabled',
				'wp-plugin-bluehost'
			),
			disabledTitle: __(
				'10Web Editor Support Disabled',
				'wp-plugin-bluehost'
			),
			enabledText: __(
				'PostHog session replay will load on the WVC editor screen after a page reload.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'PostHog session replay will no longer load on the WVC editor screen.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default TenWebEditorSupportSettings;
