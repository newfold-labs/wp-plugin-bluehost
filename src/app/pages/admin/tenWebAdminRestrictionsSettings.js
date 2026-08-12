import { __ } from '@wordpress/i18n';
import FeatureToggle from '../../components/FeatureToggle';

const TenWebAdminRestrictionsSettings = () => (
	<FeatureToggle
		featureKey="tenwebAdminRestrictions"
		toggleId="tenweb-admin-restrictions-toggle"
		label={ __( '10Web Admin Restrictions', 'wp-plugin-bluehost' ) }
		description={ __(
			'Prevents theme switching and limits plugin access on 10Web AI editor sites.',
			'wp-plugin-bluehost'
		) }
		notices={ {
			enabledTitle: __(
				'10Web Admin Restrictions Enabled',
				'wp-plugin-bluehost'
			),
			disabledTitle: __(
				'10Web Admin Restrictions Disabled',
				'wp-plugin-bluehost'
			),
			enabledText: __(
				'Theme switching and plugin access restrictions are active on 10Web editor sites.',
				'wp-plugin-bluehost'
			),
			disabledText: __(
				'Theme switching and plugin access restrictions are no longer enforced.',
				'wp-plugin-bluehost'
			),
		} }
	/>
);

export default TenWebAdminRestrictionsSettings;
