import { useEffect } from '@wordpress/element';
import { Container, Page, Title } from '@newfold/ui-component-library';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import useContainerBlockIsTarget from 'App/util/hooks/useContainerBlockTarget';
import ComingSoon from './comingSoon';
import AutomaticUpdates from './automaticUpdates';
import HelpCenterSettings from './helpCenterSettings';
import WonderBlocksSettings from './wonderBlocksSettings';
import ContentSettings from './contentSettings';
import CommentSettings from './commentSettings';
import { useLocation } from 'react-router-dom';

const Settings = () => {
	const location = useLocation();

	useEffect( () => {
		// run when mounts
		const stagingPortal = document.getElementById( 'staging-portal' );
		const performancePortal =
			document.getElementById( 'performance-portal' );
		if ( stagingPortal ) {
			window.NFDPortalRegistry.registerPortal( 'staging', stagingPortal );
		}
		if ( performancePortal ) {
			window.NFDPortalRegistry.registerPortal(
				'performance',
				performancePortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'staging' );
			window.NFDPortalRegistry.unregisterPortal( 'performance' );
		};
	}, [] );

	// Auto-open accordion sections based on URL hash
	useEffect( () => {
		const path = location.pathname;

		// Close all accordion sections first
		const allDetails = document.querySelectorAll( '.nfd-details' );
		allDetails.forEach( ( details ) => {
			details.removeAttribute( 'open' );
		} );

		// Map URL paths to accordion selectors
		const accordionMap = {
			'/settings/performance': '.performance-details',
			'/settings/staging': '.staging-details',
			'/settings/settings': '.settings-details',
		};

		// Open the appropriate accordion section
		const targetSelector = accordionMap[ path ];
		if ( targetSelector ) {
			const targetDetails = document.querySelector( targetSelector );
			if ( targetDetails ) {
				targetDetails.setAttribute( 'open', 'true' );
			}
		}
	}, [ location.pathname ] );

	return (
		<Page title="Settings" className={ 'wppbh-app-settings-page' }>
			<div className={ 'wppbh-app-settings-page__header' }>
				<Title as="h1">{ __( 'Manage WordPress', 'wp-plugin-bluehost' ) }</Title>
				<Title as="h2" className="nfd-font-normal nfd-text-[13px]">
					{ __(
						'Optimize your website my managing cache, security and performance settings.',
						'wp-plugin-bluehost'
					) }
				</Title>
			</div>
			<Container
				id="nfd-performance"
				className={ 'nfd-settings-app-wrapper nfd-performance' }
			>
				<details className="nfd-details settings-app-wrapper performance-details">
					<summary>
						<div
							id={ 'performance-header' }
							className={ 'wppbh-app-performance-header' }
						>
							<Title as={ 'h1' } className={ 'nfd-mb-2' }>
								{ __( 'Performance', 'wp-plugin-bluehost' ) }
							</Title>
							<Title
								as={ 'h2' }
								className="nfd-font-normal nfd-text-[13px]"
							>
								{ __(
									'Optimize your website by managing cache and performance settings',
									'wp-plugin-bluehost'
								) }
							</Title>
						</div>
						<span className="nfd-details-icon">
							<ChevronUpIcon />
						</span>
					</summary>
					<div id="nfd-performance-portal-wrapper">
						<div id="performance-portal"></div>
					</div>
				</details>
			</Container>
			<Container
				className={
					'nfd-settings-app-wrapper wppbh-app-settings-container'
				}
			>
				<details className="nfd-details settings-app-wrapper settings-details">
					<summary>
						<div
							id={ 'settings-header' }
							className={ 'wppbh-app-settings-header' }
						>
							<Title as={ 'h1' } className={ 'nfd-mb-2' }>
								{ __(
									'General Settings',
									'wp-plugin-bluehost'
								) }
							</Title>
							<Title
								as={ 'h2' }
								className="nfd-font-normal nfd-text-[13px]"
							>
								{ __(
									'Manage common settings for your website',
									'wp-plugin-bluehost'
								) }
							</Title>
						</div>
						<span className="nfd-details-icon">
							<ChevronUpIcon />
						</span>
					</summary>

					<Container.Block
						separator={ true }
						id={ 'coming-soon-section' }
						className={ classNames(
							'wppbh-app-settings-coming-soon',
							useContainerBlockIsTarget(
								'coming-soon-section'
							) && 'wppbh-animation-blink'
						) }
					>
						<ComingSoon />
					</Container.Block>

					<Container.Block
						separator={ true }
						id={ 'wonder-blocks-section' }
						className={ 'wppbh-app-settings-wonder-blocks' }
					>
						<Container.SettingsField
							title={ __( 'Features', 'wp-plugin-bluehost' ) }
							description={ __(
								'Customize the available features as you manage your website.',
								'wp-plugin-bluehost'
							) }
						>
							<WonderBlocksSettings />
							<br />
							<HelpCenterSettings />
						</Container.SettingsField>
					</Container.Block>

					<Container.Block
						separator={ true }
						className={ 'wppbh-app-settings-update' }
					>
						<AutomaticUpdates />
					</Container.Block>

					<Container.Block
						separator={ true }
						id={ 'content-section' }
						className={ 'wppbh-app-settings-content' }
					>
						<ContentSettings />
					</Container.Block>

					<Container.Block
						id={ 'comments-section' }
						className={ 'wppbh-app-settings-comments' }
					>
						<CommentSettings />
					</Container.Block>
				</details>
			</Container>
			<Container className={ 'nfd-settings-app-wrapper nfd-staging' }>
				<details className="nfd-details settings-app-wrapper staging-details">
					<summary>
						<div
							id={ 'staging-header' }
							className={ 'wppbh-app-staging-header' }
						>
							<Title as={ 'h1' } className={ 'nfd-mb-2' }>
								{ __( 'Staging', 'wp-plugin-bluehost' ) }
							</Title>
							<Title
								as={ 'h2' }
								className="nfd-font-normal nfd-text-[13px]"
							>
								{ __(
									'A staging site is a duplicate of your live site, offering a secure environment to experiment, test updates, and deploy when ready.',
									'wp-plugin-bluehost'
								) }
							</Title>
						</div>
						<span className="nfd-details-icon">
							<ChevronUpIcon />
						</span>
					</summary>
					<div
						id="nfd-staging-portal-wrapper"
						className="nfd-staging"
					>
						<div id="staging-portal"></div>
					</div>
				</details>
			</Container>
		</Page>
	);
};

export default Settings;
