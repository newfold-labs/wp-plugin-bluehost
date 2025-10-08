import { __ } from '@wordpress/i18n';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { Card, Title } from '@newfold/ui-component-library';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-help-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-nfd-click="newfold-quick-links-help"
		data-test-id="quick-links-help-link"
		href={ '#/help' }
		onClick={ ( e ) => {
			if (
				NewfoldRuntime.hasCapability( 'canAccessHelpCenter' ) &&
				window.NewfoldFeatures.isEnabled( 'helpCenter' )
			) {
				e.preventDefault();
				window.newfoldEmbeddedHelp.toggleNFDLaunchedEmbeddedHelp();
			}
		} }
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
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Master WordPress with help from our AI assistant.',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Launch our AI Help', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
