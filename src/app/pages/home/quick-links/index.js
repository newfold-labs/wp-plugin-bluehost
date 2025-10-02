import { default as YoastQuickLink } from './yoast';
import { default as SettingsQuickLink } from './settings';
import { default as AiEditorQuickLink } from './ai-editor';
import { default as HelpQuickLink } from './help';

export default () => (
	<>
		<YoastQuickLink />
		<SettingsQuickLink />
		<AiEditorQuickLink />
		<HelpQuickLink />
	</>
);
