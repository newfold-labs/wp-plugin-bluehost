import HelpCenterSettings from '../settings/helpCenterSettings';
import WonderBlocksSettings from '../settings/wonderBlocksSettings';
import StagingFeatureSettings from '../settings/stagingFeatureSettings';
import PerformanceFeatureSettings from '../settings/performanceFeatureSettings';
import TenWebAdminRestrictionsSettings from './tenWebAdminRestrictionsSettings';
import TenWebEditorSupportSettings from './tenWebEditorSupportSettings';
import { Container, Page } from '@newfold/ui-component-library';

const Admin = () => {
	return (
		<Page title="Admin" className={ 'wppbh-app-settings-page' }>
			<Container className={ 'wppbh-app-settings-container' }>
				<Container.Header
					title={ __( 'Admin', 'wp-plugin-bluehost' ) }
					description={ __(
						'Secret page to manage admin features and settings.',
						'wp-plugin-bluehost'
					) }
					className={ 'wppbh-app-settings-header' }
				/>

				<Container.Block
					separator={ true }
					id={ 'help-center' }
					className={ classNames( 'wppbh-app-admin' ) }
				>
					<Container.SettingsField
						title="Features"
						description="Toggle features – not settings."
					>
						<WonderBlocksSettings />
						<br />
						<HelpCenterSettings forceShow={ true } />
						<br />
						<StagingFeatureSettings />
						<br />
						<PerformanceFeatureSettings />
						<br />
						<TenWebAdminRestrictionsSettings />
						<br />
						<TenWebEditorSupportSettings />
					</Container.SettingsField>
				</Container.Block>
			</Container>
		</Page>
	);
};

export default Admin;
