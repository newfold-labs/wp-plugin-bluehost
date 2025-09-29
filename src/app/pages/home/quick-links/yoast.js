import { Card, Title } from '@newfold/ui-component-library';
import { YoastLogoIcon } from '../../../components/icons';
import { __ } from '@wordpress/i18n';

export default () => (
	<Card
		className={
			'nfd-quick-links-card nfd-quick-links-yoast-card nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5] nfd-shadow-none'
		}
	>
		<div
			className={
				'nfd-quick-links-card__head nfd-flex nfd-items-center nfd-gap-2'
			}
		>
			<span className={ 'nfd-quick-links-card__icon' }>
				<YoastLogoIcon width={ 24 } height={ 24 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Optimize your content', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		{ __(
			'Optimize your content for search engines and boost your store visibility.',
			'wp-plugin-bluehost'
		) }
		<a
			href={ '#/yoast' }
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Start now', 'wp-plugin-bluehost' ) }
		</a>
	</Card>
);
