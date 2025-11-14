import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { StarIcon } from '@heroicons/react/24/outline';
import { addUtmParams } from 'App/util/helpers';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-refer-friend-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-nfd-click="newfold-quick-links-refer-friend"
		data-test-id="quick-links-refer-friend-link"
		href={ addUtmParams(
			'https://www.bluehost.com/affiliates'
		) }
		target="_blank"
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
				<StarIcon width={ 16 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Refer a Friend', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Unlock exclusive benefits with our referral program.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Start Now', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
