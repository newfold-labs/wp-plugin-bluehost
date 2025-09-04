import { default as YoastQuickLink } from './yoast';
import { default as SettingsQuickLink } from './settings';
import { default as AiBuilderQuickLink } from './ai-builder';
import { default as AiEditorQuickLink } from './ai-editor';
import { default as HelpQuickLink } from './help';


export default () => (
	<>
		<YoastQuickLink />
		<SettingsQuickLink />
		<AiBuilderQuickLink />
		<AiEditorQuickLink />
		<HelpQuickLink />
	</>
)