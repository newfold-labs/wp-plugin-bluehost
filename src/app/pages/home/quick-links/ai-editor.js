import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { AiEditorIcon } from 'App/components/icons';
import { getEditorUrl } from 'App/util/themeUtils';

export default () => (
	<Card
		as="a"
		className={ classNames(
			'nfd-quick-links-card nfd-quick-links-ai-editor-card',
			'nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5]',
			'nfd-no-underline nfd-shadow-none nfd-transition-all hover:nfd-shadow-md'
		) }
		data-nfd-click="newfold-quick-links-ai-editor"
		data-test-id="quick-links-ai-editor-link"
		href={ getEditorUrl( 'edit' ) }
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
				<AiEditorIcon />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Launch our AI Editor', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		<p className="nfd-mt-0 nfd-text-body">
			{ __(
				'Say hello to effortless site building with a wide library of 250+ blocks',
				'wp-plugin-bluehost'
			) }
		</p>
		<p
			className={
				'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]'
			}
		>
			{ __( 'Launch the Editor', 'wp-plugin-bluehost' ) }
		</p>
	</Card>
);
