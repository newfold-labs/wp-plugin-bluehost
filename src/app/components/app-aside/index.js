import { YoastAd } from './YoastAd';

/**
 * App Aside
 * Renders the Yoast ad only when the site does not have Yoast Premium
 * (NewfoldRuntime.wordpress.hasYoastPremium from PHP runtime).
 *
 * @return {JSX.Element} app aside component
 */
export const AppAside = () => {
	const hasYoastPremium =
		window.NewfoldRuntime?.wordpress?.hasYoastPremium === true;

	return (
		<div className="wppbh-app-aside" data-test-id="app-aside">
			<div className="wppbh-app-aside-content">
				{ ! hasYoastPremium && <YoastAd /> }
			</div>
		</div>
	);
};
