import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-settings-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-nfd-click="newfold-quick-links-settings"
        data-test-id="quick-links-settings-link"
		href={ '#/settings' }
	>
		<div
			className={
				'nfd-quick-links-card__head nfd-flex nfd-items-center nfd-gap-2'
			}
		>
			<span
				className={
					'nfd-quick-links-card__icon nfd-p-[4px] nfd-bg-[#ddecff] nfd-rounded-[5px]'
				}
			>
				<WrenchScrewdriverIcon width={ 16 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Manage WordPress', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Security, performance, backups, staging & more.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p className={ 'nfd-mt-0 nfd-font-semibold nfd-text-[#196BDE]' }>
			{ __( 'Manage', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
