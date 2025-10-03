import { default as YoastQuickLink } from './yoast';
import { default as SettingsQuickLink } from './settings';
import { default as AiEditorQuickLink } from './ai-editor';
import { default as HelpQuickLink } from './help';
import { default as ProDesignQuickLink } from './pro-design';
import { default as ReferFriendQuickLink } from './refer-friend';
// import { default as AiBuilderQuickLink } from './ai-builder';

export default () => (
	<>
		<YoastQuickLink />
		<SettingsQuickLink />
		<AiEditorQuickLink />
		<HelpQuickLink />
		<ProDesignQuickLink />
		<ReferFriendQuickLink />
	</>
);
