import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { Alert, Container, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../../data/store';
import { bluehostSettingsApiFetch } from '../../util/helpers';
import { useNotification } from 'App/components/notifications';

const AutomaticUpdatesAll = ( { setError, notify } ) => {
	const { store, setStore } = useContext( AppStore );
	const [ autoUpdatesAll, setAutoUpdatesAll ] = useState(
		store.autoUpdatesMajorCore &&
			store.autoUpdatesPlugins &&
			store.autoUpdatesThemes
			? true
			: false
	);

	const getAllNoticeTitle = () => {
		const updatesEnabled = __(
			'Enabled All auto-updates',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Disabled All auto-updates',
			'wp-plugin-bluehost'
		);
		return autoUpdatesAll ? updatesEnabled : updatesDisabled;
	};
	const getAllNoticeText = () => {
		const updatesEnabled = __(
			'Everything will automatically update.',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Custom auto-update settings.',
			'wp-plugin-bluehost'
		);
		return autoUpdatesAll ? updatesEnabled : updatesDisabled;
	};

	const toggleAutoUpdatesAll = () => {
		if ( autoUpdatesAll ) {
			// is unchecking
			// just uncheck this one
			setAutoUpdatesAll( ! autoUpdatesAll );
		} else {
			// is checking
			bluehostSettingsApiFetch(
				{
					autoUpdatesMajorCore: true,
					autoUpdatesPlugins: true,
					autoUpdatesThemes: true,
				},
				setError,
				// eslint-disable-next-line no-unused-vars
				( response ) => {
					setAutoUpdatesAll( ! autoUpdatesAll );
				}
			);
		}
	};

	const notifySuccess = () => {
		notify.push( 'everything-autoupdate-notice', {
			title: getAllNoticeTitle(),
			description: <span>{ getAllNoticeText() }</span>,
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useEffect( () => {
		if (
			store.autoUpdatesMajorCore &&
			store.autoUpdatesPlugins &&
			store.autoUpdatesThemes
		) {
			setAutoUpdatesAll( true );
		} else {
			setAutoUpdatesAll( false );
		}
	}, [
		store.autoUpdatesMajorCore,
		store.autoUpdatesPlugins,
		store.autoUpdatesThemes,
	] );

	useUpdateEffect( () => {
		setStore( {
			...store,
			autoUpdatesAll,
		} );

		notifySuccess();
	}, [ autoUpdatesAll ] );

	return (
		<ToggleField
			id="autoupdate-all-toggle"
			label={ __(
				'Automatically keep all up to date',
				'wp-plugin-bluehost'
			) }
			checked={ autoUpdatesAll }
			onChange={ toggleAutoUpdatesAll }
		/>
	);
};

const AutomaticUpdatesMajorCore = ( { setError, notify } ) => {
	const { store, setStore } = useContext( AppStore );
	const [ autoUpdatesMajorCore, setAutoUpdatesCore ] = useState(
		store.autoUpdatesMajorCore
	);

	const getCoreNoticeTitle = () => {
		const updatesEnabled = __(
			'Enabled Core auto-updates',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Disabled Core auto-updates',
			'wp-plugin-bluehost'
		);
		return autoUpdatesMajorCore ? updatesEnabled : updatesDisabled;
	};
	const getCoreNoticeText = () => {
		const updatesEnabled = __(
			'WordPress will automatically update.',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'WordPress must be manually updated.',
			'wp-plugin-bluehost'
		);
		return autoUpdatesMajorCore ? updatesEnabled : updatesDisabled;
	};

	const toggleAutoUpdatesMajorCore = () => {
		bluehostSettingsApiFetch(
			{ autoUpdatesMajorCore: ! autoUpdatesMajorCore },
			setError,
			// eslint-disable-next-line no-unused-vars
			( response ) => {
				setAutoUpdatesCore( ! autoUpdatesMajorCore );
			}
		);
	};

	const notifySuccess = () => {
		notify.push( 'major-core-autoupdate-notice', {
			title: getCoreNoticeTitle(),
			description: <span>{ getCoreNoticeText() }</span>,
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			autoUpdatesMajorCore,
		} );

		notifySuccess();
	}, [ autoUpdatesMajorCore ] );

	return (
		<ToggleField
			id="autoupdate-core-toggle"
			label={ __( 'WordPress Core', 'wp-plugin-bluehost' ) }
			checked={ autoUpdatesMajorCore || store.autoUpdatesAll }
			disabled={ store.autoUpdatesAll }
			onChange={ toggleAutoUpdatesMajorCore }
		/>
	);
};

const AutomaticUpdatesPlugins = ( { setError, notify } ) => {
	const { store, setStore } = useContext( AppStore );
	const [ autoUpdatesPlugins, setAutoUpdatesPlugins ] = useState(
		store.autoUpdatesPlugins
	);

	const getPluginsNoticeTitle = () => {
		const updatesEnabled = __(
			'Enabled Plugins auto-update',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Disabled Plugins auto-update',
			'wp-plugin-bluehost'
		);
		return autoUpdatesPlugins ? updatesEnabled : updatesDisabled;
	};
	const getPluginsNoticeText = () => {
		const updatesEnabled = __(
			'All plugins will automatically update.',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Each plugin must be manually updated.',
			'wp-plugin-bluehost'
		);
		return autoUpdatesPlugins ? updatesEnabled : updatesDisabled;
	};

	const toggleAutoUpdatesPlugins = () => {
		bluehostSettingsApiFetch(
			{ autoUpdatesPlugins: ! autoUpdatesPlugins },
			setError,
			// eslint-disable-next-line no-unused-vars
			( response ) => {
				setAutoUpdatesPlugins( ! autoUpdatesPlugins );
			}
		);
	};

	const notifySuccess = () => {
		notify.push( 'plugins-autoupdate-notice', {
			title: getPluginsNoticeTitle(),
			description: <span>{ getPluginsNoticeText() }</span>,
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			autoUpdatesPlugins,
		} );

		notifySuccess();
	}, [ autoUpdatesPlugins ] );

	return (
		<ToggleField
			id="autoupdate-plugins-toggle"
			label={ __( 'Plugins', 'wp-plugin-bluehost' ) }
			checked={ autoUpdatesPlugins || store.autoUpdatesAll }
			disabled={ store.autoUpdatesAll }
			onChange={ toggleAutoUpdatesPlugins }
		/>
	);
};

const AutomaticUpdatesThemes = ( { setError, notify } ) => {
	const { store, setStore } = useContext( AppStore );
	const [ autoUpdatesThemes, setAutoUpdatesThemes ] = useState(
		store.autoUpdatesThemes
	);

	const getThemesNoticeTitle = () => {
		const updatesEnabled = __(
			'Enabled Themes auto-update',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Disabled Themes auto-update',
			'wp-plugin-bluehost'
		);
		return autoUpdatesThemes ? updatesEnabled : updatesDisabled;
	};

	const getThemesNoticeText = () => {
		const updatesEnabled = __(
			'All themes will automatically update.',
			'wp-plugin-bluehost'
		);
		const updatesDisabled = __(
			'Each theme must be manually updated.',
			'wp-plugin-bluehost'
		);
		return autoUpdatesThemes ? updatesEnabled : updatesDisabled;
	};

	const toggleAutoUpdatesThemes = () => {
		bluehostSettingsApiFetch(
			{ autoUpdatesThemes: ! autoUpdatesThemes },
			setError,
			// eslint-disable-next-line no-unused-vars
			( response ) => {
				setAutoUpdatesThemes( ! autoUpdatesThemes );
			}
		);
	};

	const notifySuccess = () => {
		notify.push( 'themes-autoupdate-notice', {
			title: getThemesNoticeTitle(),
			description: <span>{ getThemesNoticeText() }</span>,
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			autoUpdatesThemes,
		} );

		notifySuccess();
	}, [ autoUpdatesThemes ] );

	return (
		<ToggleField
			id="autoupdate-themes-toggle"
			label={ __( 'Themes', 'wp-plugin-bluehost' ) }
			checked={ autoUpdatesThemes || store.autoUpdatesAll }
			disabled={ store.autoUpdatesAll }
			onChange={ toggleAutoUpdatesThemes }
		/>
	);
};

const AutomaticUpdates = () => {
	const [ isError, setError ] = useState( false );

	const notify = useNotification();

	return (
		<Container.SettingsField
			title={ __( 'Automatic Updates', 'wp-plugin-bluehost' ) }
			description={ __(
				'Keeping automatic updates on ensures timely security fixes and the latest features.',
				'wp-plugin-bluehost'
			) }
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-4">
				<AutomaticUpdatesAll setError={ setError } notify={ notify } />
				<AutomaticUpdatesMajorCore
					setError={ setError }
					notify={ notify }
				/>
				<AutomaticUpdatesPlugins
					setError={ setError }
					notify={ notify }
				/>
				<AutomaticUpdatesThemes
					setError={ setError }
					notify={ notify }
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
		</Container.SettingsField>
	);
};

export default AutomaticUpdates;
