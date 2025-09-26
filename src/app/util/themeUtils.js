/**
 * Utility functions for WordPress theme detection
 */

/**
 * Check if the current WordPress theme is a block theme
 * @returns {boolean} True if the current theme is a block theme, false otherwise
 */
export const isBlockTheme = () => {
	return window.NewfoldRuntime?.wordpress?.isBlockTheme || false;
};

/**
 * Get the appropriate editor URL based on the current theme type
 * @param {string} canvas - Optional canvas parameter for site editor (default: 'edit')
 * @returns {string} The appropriate editor URL
 */
export const getEditorUrl = (canvas = 'edit') => {
	const isBlock = isBlockTheme();
	
	if (isBlock) {
		return `${window.NewfoldRuntime.adminUrl}site-editor.php?canvas=${canvas}`;
	} else {
		return `${window.NewfoldRuntime.adminUrl}customize.php`;
	}
};

/**
 * Get the appropriate editor label based on the current theme type
 * @returns {string} The appropriate editor label
 */
export const getEditorLabel = () => {
	return isBlockTheme() ? 'Site Editor' : 'Customizer';
};
