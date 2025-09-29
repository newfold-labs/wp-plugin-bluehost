import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card
		className={
			'nfd-quick-links-card nfd-quick-links-help-card nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5] nfd-shadow-none'
		}
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
				<LightBulbIcon width={ 16 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Get Help', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		{ __(
			'Master WordPress with help from our AI assistant.',
			'wp-plugin-bluehost'
		) }
		<a
			href={ '#/help' }
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Launch our AI Help', 'wp-plugin-bluehost' ) }
		</a>
	</Card>
);
