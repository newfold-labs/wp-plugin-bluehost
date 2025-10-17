import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-pro-design-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-action="load-nfd-ctb"
		data-ctb-id="838cc912-adb3-4d75-9450-262bf3ee3576"
		data-nfd-click="newfold-quick-links-pro-design"
		data-test-id="quick-links-pro-design-link"
		href={ window.NewfoldRuntime?.linkTracker?.addUtmParams(
			'https://www.bluehost.com/my-account/market-place'
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
				<PaintBrushIcon width={ 16 } />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Pro Design Live', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'We will help you build and grow your website and improve your skills in WordPress.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Get Info', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
