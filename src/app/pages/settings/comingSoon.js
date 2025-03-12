import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { Alert, Container, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../../data/store';
import {
	bluehostSettingsApiFetch,
	comingSoonAdminbarToggle,
} from '../../util/helpers';
import { useNotification } from 'App/components/notifications';

const ComingSoon = () => {
	const { store, setStore } = useContext( AppStore );
	const [ comingSoon, setComingSoon ] = useState( store.comingSoon );
	const [ isError, setError ] = useState( false );

	const notify = useNotification();

	const getComingSoonNoticeTitle = () => {
		const comingSoonActived = __(
			'Coming soon activated',
			'wp-plugin-bluehost'
		);
		const comingSoonDeactivated = __(
			'Coming soon deactivated',
			'wp-plugin-bluehost'
		);
		return comingSoon ? comingSoonActived : comingSoonDeactivated;
	};

	const getComingSoonNoticeText = () => {
		const comingSoonActive = __(
			'Coming soon page is active. Site requires login.',
			'wp-plugin-bluehost'
		);
		const comingSoonNotActive = __(
			'Coming soon page is not active. Site is live to visitors.',
			'wp-plugin-bluehost'
		);
		return comingSoon ? comingSoonActive : comingSoonNotActive;
	};

	const toggleComingSoon = () => {
		bluehostSettingsApiFetch(
			{ comingSoon: ! comingSoon },
			setError,
			// eslint-disable-next-line no-unused-vars
			( response ) => {
				setComingSoon( ! comingSoon );
			}
		);
	};

	const notifySuccess = () => {
		notify.push( 'coming-soon-toggle-notice', {
			title: getComingSoonNoticeTitle(),
			description: <span>{ getComingSoonNoticeText() }</span>,
			variant: 'success',
			autoDismiss: 5000,
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			comingSoon,
		} );

		notifySuccess();
		comingSoonAdminbarToggle( comingSoon );
	}, [ comingSoon ] );

	const getComingSoonSectionTitle = () => {
		const status = __( 'Site Status', 'wp-plugin-bluehost' );
		const statusNotLive = __( 'Not Live', 'wp-plugin-bluehost' );
		const statusNotLiveClasses = 'nfd-text-[#e10001] coming-soon-status';
		const statusLive = __( 'Live', 'wp-plugin-bluehost' );
		const statusLiveClasses = 'nfd-text-[#008112] coming-soon-status';

		const statusText = comingSoon ? statusNotLive : statusLive;
		const statusClasses = comingSoon
			? statusNotLiveClasses
			: statusLiveClasses;

		return (
			<span className={ statusClasses }>
				{ status }: { statusText }
			</span>
		);
	};

	const getComingSoonSectionDescription = () => {
		const comingSoonActive = __(
			'Turn off your "Coming Soon" page when you are ready to launch your website.',
			'wp-plugin-bluehost'
		);
		const comingSoonNotActive = __(
			'Turn on your "Coming Soon" page when you need to make major changes to your website.',
			'wp-plugin-bluehost'
		);
		return comingSoon ? comingSoonActive : comingSoonNotActive;
	};

	return (
		<Container.SettingsField
			title={ getComingSoonSectionTitle() }
			description={ getComingSoonSectionDescription() }
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-6">
				<ToggleField
					id="coming-soon-toggle"
					label="Coming Soon page"
					description={ __(
						'Your Bluehost Coming Soon page lets you hide your site from visitors while you make the magic happen.',
						'wp-plugin-bluehost'
					) }
					checked={ comingSoon }
					onChange={ () => {
						toggleComingSoon();
					} }
				/>

				{ comingSoon && (
					<Alert variant="info">
						{ __(
							'Your website is currently displaying a "Coming Soon" page.',
							'wp-plugin-bluehost'
						) }
					</Alert>
				) }

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

export default ComingSoon;
