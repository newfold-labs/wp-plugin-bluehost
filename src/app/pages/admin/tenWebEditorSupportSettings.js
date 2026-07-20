import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { Alert, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../../data/store';
import { featureToggle } from '../../util/helpers';
import { useNotification } from 'App/components/notifications';

const TenWebEditorSupportSettings = () => {
	const { store, setStore } = useContext( AppStore );
	const [ editorSupport, setEditorSupport ] = useState(
		store.features.tenwebEditorSupport
	);
	const [ editorSupportLocked, setEditorSupportLocked ] = useState(
		! store.toggleableFeatures.tenwebEditorSupport
	);
	const [ isError, setError ] = useState( false );
	const notify = useNotification();

	const getNoticeTitle = () => {
		const enabled = __(
			'10Web Editor Support Enabled',
			'wp-plugin-bluehost'
		);
		const disabled = __(
			'10Web Editor Support Disabled',
			'wp-plugin-bluehost'
		);
		return editorSupport ? enabled : disabled;
	};

	const getNoticeText = () => {
		const enabled = __(
			'PostHog session replay will load on the WVC editor screen after a page reload.',
			'wp-plugin-bluehost'
		);
		const disabled = __(
			'PostHog session replay will no longer load on the WVC editor screen.',
			'wp-plugin-bluehost'
		);
		return editorSupport ? enabled : disabled;
	};

	const toggleEditorSupport = () => {
		featureToggle( 'tenwebEditorSupport', ( response ) => {
			if ( response.success ) {
				setEditorSupport( ! editorSupport );
			} else {
				setEditorSupportLocked( true );
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
			tenwebEditorSupport: editorSupport,
		} );
		notifySuccess( getNoticeTitle, getNoticeText );
	}, [ editorSupport ] );

	return (
		<div className="nfd-flex nfd-flex-col nfd-gap-6">
			<ToggleField
				id="tenweb-editor-support-toggle"
				label="10Web Editor Support"
				description={ __(
					'Loads PostHog session replay on the WVC editor admin screen.',
					'wp-plugin-bluehost'
				) }
				disabled={ editorSupportLocked }
				checked={ editorSupport }
				onChange={ toggleEditorSupport }
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

export default TenWebEditorSupportSettings;
