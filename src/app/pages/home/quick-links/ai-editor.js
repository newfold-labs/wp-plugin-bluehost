import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { AiEditorIcon } from "../../../components/icons";

export default () => (
	<Card className={ 'nfd-quick-links-card nfd-quick-links-ai-editor-card nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5] nfd-shadow-none' }>
		<div className={ 'nfd-quick-links-card__head nfd-flex nfd-items-center nfd-gap-2' }>
			<span className={ 'nfd-quick-links-card__icon nfd-p-[4px] nfd-bg-[#ddecff] nfd-rounded-[5px]' }>
				<AiEditorIcon />
			</span>
			<Title as={ 'h2' } className={ 'nf-text-base nfd-font-semibold' }>
				{ __( 'Launch our AI Editor', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
		{ __( 'Say hello to effortless site building with a wide library of 250+ blocks', 'wp-plugin-bluehost' ) }
		<a className={ 'nfd-mt-0 nfd-font-semibold nfd-no-underline nfd-text-[#196BDE]' }>
			{ __( 'Launch the Editor', 'wp-plugin-bluehost' ) }
		</a>
	</Card>
)