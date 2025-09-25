import { Container, Page, Title } from '@newfold/ui-component-library';
import useContainerBlockIsTarget from 'App/util/hooks/useContainerBlockTarget';
import ComingSoon from './comingSoon';
import AutomaticUpdates from './automaticUpdates';
import HelpCenterSettings from './helpCenterSettings';
import WonderBlocksSettings from './wonderBlocksSettings';
import ContentSettings from './contentSettings';
import CommentSettings from './commentSettings';
// import SocialMediaAccounts from './socialMediaAccounts';

const Settings = () => {
	return (
		<Page title="Settings" className={ 'wppbh-app-settings-page' }>
			<div
				id={ 'settings-header' }
				className={ 'wppbh-app-settings-header' }
			>
				<Title as={ 'h1' } className={ 'nfd-mb-2' }>
					{ __( 'Settings', 'wp-plugin-bluehost' ) }
				</Title>
				<Title as={ 'h2' } className="nfd-font-normal nfd-text-[13px]">
					{ __(
						'Manage common settings for your website',
						'wp-plugin-bluehost'
					) }
				</Title>
			</div>
			<Container className={ 'wppbh-app-settings-container' }>
				<Container.Block
					separator={ true }
					id={ 'coming-soon-section' }
					className={ classNames(
						'wppbh-app-settings-coming-soon',
						useContainerBlockIsTarget( 'coming-soon-section' ) &&
							'wppbh-animation-blink'
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
			</Container>
		</Page>
	);
};

export default Settings;
