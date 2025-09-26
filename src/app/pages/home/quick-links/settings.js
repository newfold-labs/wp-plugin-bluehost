import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card className={ 'nfd-quick-links-card nfd-quick-links-settings-card nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5] nfd-shadow-none' }>
		<div className={ 'nfd-quick-links-card__head nfd-flex nfd-items-center nfd-gap-2' }>
			<span className={ 'nfd-quick-links-card__icon nfd-p-[4px] nfd-bg-[#ddecff] nfd-rounded-[5px]' }>
				<WrenchScrewdriverIcon width={ 16 }/>
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Manage WordPress', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		{ __( 'Security, performance, backups, staging & more.', 'wp-plugin-bluehost' ) }
		<a 
			href={ '#/settings' }
			className={ 'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]' }
		>
			{ __( 'Manage', 'wp-plugin-bluehost' ) }
		</a>
	</Card>
)