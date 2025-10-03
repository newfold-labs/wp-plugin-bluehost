import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-ai-builder-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-nfd-click="newfold-quick-links-ai-builder"
		data-test-id="quick-links-ai-builder-link"
		href={ '#/ai-builder' }
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
				<SparklesIcon width={ 16 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Want a fresh start?', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Relaunch the AI Builder to replace this site with a new one.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Create a new site', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
