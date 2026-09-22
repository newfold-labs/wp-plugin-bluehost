import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const TenWebDomainSearchSettings = () => (
	<FeatureToggle
		featureKey="tenwebDomainSearch"
		toggleId="tenweb-domain-search-toggle"
		label={ __( '10Web Domain Search', 'wp-plugin-bluehost' ) }
		description={ __(
			'Adds Bluehost domain search to the WVC editor.',
			'wp-plugin-bluehost'
		) }
		notices={ {
			enabledTitle: __(
				'10Web Domain Search Enabled',
				'wp-plugin-bluehost'
			),
			disabledTitle: __(
				'10Web Domain Search Disabled',
				'wp-plugin-bluehost'
			),
			enabledText: __(
				'Domain search will load in the WVC editor after a page reload.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'Domain search will no longer load in the WVC editor.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default TenWebDomainSearchSettings;
