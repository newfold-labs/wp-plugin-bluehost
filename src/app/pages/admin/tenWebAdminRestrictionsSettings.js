import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { Alert, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../../data/store';
import { featureToggle } from '../../util/helpers';
import { useNotification } from 'App/components/notifications';

const TenWebAdminRestrictionsSettings = () => {
	const { store, setStore } = useContext( AppStore );
	const [ adminRestrictions, setAdminRestrictions ] = useState(
		store.features.tenwebAdminRestrictions
	);
	const [ adminRestrictionsLocked, setAdminRestrictionsLocked ] = useState(
		! store.toggleableFeatures.tenwebAdminRestrictions
	);
	const [ isError, setError ] = useState( false );
	const notify = useNotification();

	const getNoticeTitle = () => {
		const enabled = __(
			'10Web Admin Restrictions Enabled',
			'wp-plugin-bluehost'
		);
		const disabled = __(
			'10Web Admin Restrictions Disabled',
			'wp-plugin-bluehost'
		);
		return adminRestrictions ? enabled : disabled;
	};

	const getNoticeText = () => {
		const enabled = __(
			'Theme switching and plugin access restrictions are active on 10Web editor sites.',
			'wp-plugin-bluehost'
		);
		const disabled = __(
			'Theme switching and plugin access restrictions are no longer enforced.',
			'wp-plugin-bluehost'
		);
		return adminRestrictions ? enabled : disabled;
	};

	const toggleAdminRestrictions = () => {
		featureToggle( 'tenwebAdminRestrictions', ( response ) => {
			if ( response.success ) {
				setAdminRestrictions( ! adminRestrictions );
			} else {
				setAdminRestrictionsLocked( true );
				setError( true );
				notifyError();
			}
		} );
	};

	const notifyError = () => {
		notify.push( 'feature-toggle-notice', {
			title: __( 'Sorry, that is not allowed.', 'wp-plugin-bluehost' ),
			description: __(
				'This feature cannot currently be modified.',
				'wp-plugin-bluehost'
			),
			variant: 'error',
		} );
	};

	const notifySuccess = ( renderTitle, renderDescription ) => {
		notify.push( 'feature-toggle-notice', {
			title: renderTitle(),
			description: renderDescription(),
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			tenwebAdminRestrictions: adminRestrictions,
		} );
		notifySuccess( getNoticeTitle, getNoticeText );
	}, [ adminRestrictions ] );

	return (
		<div className="nfd-flex nfd-flex-col nfd-gap-6">
			<ToggleField
				id="tenweb-admin-restrictions-toggle"
				label="10Web Admin Restrictions"
				description={ __(
					'Prevents theme switching and limits plugin access on 10Web AI editor sites.',
					'wp-plugin-bluehost'
				) }
				disabled={ adminRestrictionsLocked }
				checked={ adminRestrictions }
				onChange={ toggleAdminRestrictions }
			/>

			{ isError && (
				<Alert variant="error">
					{ __(
						'Oops! Something went wrong. Please try again.',
						'wp-plugin-bluehost'
					) }
				</Alert>
			) }
		</div>
	);
};

export default TenWebAdminRestrictionsSettings;
