import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { YoastLogoIcon } from '../../../components/icons';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-yoast-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-action="load-nfd-ctb"
		data-ctb-id="57d6a568-783c-45e2-a388-847cff155897"
		data-nfd-click="newfold-quick-links-yoast"
		data-cy="quick-links-yoast-link"
		href={
			'https://yoast.com/?yst-add-to-cart=2811749&utm_source=plugin-home&utm_medium=brand-plugin&channelid=P99C100S1N0B3003A151D115E0000V112'
		}
		target="_blank"
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
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Optimize your content for search engines and boost your store visibility.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Start now', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
