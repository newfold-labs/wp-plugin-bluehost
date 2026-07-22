import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useUpdateEffect } from 'react-use';
import { Alert, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../data/store';
import { featureToggle, updateUI } from '../util/helpers';
import { useNotification } from 'App/components/notifications';

/**
 * Whether a feature flag is registered in the app store.
 *
 * @param {Object} store      App store state.
 * @param {string} featureKey Feature flag key.
 * @return {boolean} True when the feature exists in store.features.
 */
export const hasRegisteredFeature = ( store, featureKey ) => {
	return (
		store?.features && typeof store.features[ featureKey ] !== 'undefined'
	);
};

const FeatureToggleControl = ( {
	featureKey,
	toggleId,
	label,
	description,
	selectors = [],
	notices = {},
} ) => {
	const { store, setStore } = useContext( AppStore );
	const [ enabled, setEnabled ] = useState(
		Boolean( store.features[ featureKey ] )
	);
	const [ isLocked, setIsLocked ] = useState(
		! store.toggleableFeatures[ featureKey ]
	);
	const [ isError, setError ] = useState( false );
	const notify = useNotification();
	const noticeId = `feature-toggle-notice-${ featureKey }`;
	const selectorList = ( () => {
		if ( Array.isArray( selectors ) ) {
			return selectors;
		}
		if ( selectors ) {
			return [ selectors ];
		}
		return [];
	} )();

	const getNoticeTitle = () => {
		return enabled ? notices.enabledTitle : notices.disabledTitle;
	};

	const getNoticeText = () => {
		return enabled ? notices.enabledText : notices.disabledText;
	};

	const notifyError = () => {
		notify.push( noticeId, {
			title: __( 'Sorry, that is not allowed.', 'wp-plugin-bluehost' ),
			description: __(
				'This feature cannot currently be modified.',
				'wp-plugin-bluehost'
			),
			variant: 'error',
		} );
	};

	const notifySuccess = ( renderTitle, renderDescription ) => {
		notify.push( noticeId, {
			title: renderTitle(),
			description: renderDescription(),
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	const toggleFeature = () => {
		featureToggle( featureKey, ( response ) => {
			if ( response.success ) {
				setEnabled( ! enabled );
			} else {
				setIsLocked( true );
				setError( true );
				notifyError();
			}
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			features: {
				...store.features,
				[ featureKey ]: enabled,
			},
		} );
		notifySuccess( getNoticeTitle, getNoticeText );
		selectorList.forEach( ( selector ) => {
			updateUI( selector, enabled );
		} );
	}, [ enabled ] );

	return (
		<div className="nfd-flex nfd-flex-col nfd-gap-6">
			<ToggleField
				id={ toggleId }
				label={ label }
				description={ description }
				disabled={ isLocked }
				checked={ enabled }
				onChange={ toggleFeature }
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

/**
 * Toggle for a registered Newfold feature flag on the Admin page.
 *
 * @param {Object} props Component props.
 */
const FeatureToggle = ( props ) => {
	const { store } = useContext( AppStore );

	if ( ! hasRegisteredFeature( store, props.featureKey ) ) {
		return null;
	}

	return <FeatureToggleControl { ...props } />;
};

export default FeatureToggle;
