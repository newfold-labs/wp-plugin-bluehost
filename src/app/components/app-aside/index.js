// Import as URL so the logo renders in its own document — avoids SVG id/CSS conflicts
// with other inlined SVGs on the page (e.g. YoastLogoIcon on home quick links).
import yoastAdLogoSrc from '../../images/yoast-ad-logo.svg?url';
import { ReactComponent as ArrowRightIcon } from '../../images/yoast-ad-arrow.svg';
import { ReactComponent as BulletPointIcon } from '../../images/yoast-ad-check.svg';
import './yoast-ad.scss';

/**
 * App Aside
 * @return {JSX.Element} app aside component
 */
export const AppAside = () => {
	return (
		<div className="wppbh-app-aside">
			<div className="wppbh-app-aside-content">
				<YoastAd />
			</div>
		</div>
	);
};

/**
 * Yoast Ad
 * @return {JSX.Element} yoast ad component
 */
const YoastAd = () => {
	return (
		<div className="yoast-ad nfd-p-6 nfd-rounded-lg nfd-text-slate-600 nfd-bg-white nfd-shadow nfd-border">
			<figure className="yoast-ad-logo-square nfd-logo-square nfd-w-16 nfd-h-16 nfd-mx-auto nfd-overflow-hidden nfd-relative nfd-z-10">
				<img
					src={ yoastAdLogoSrc }
					alt="Yoast"
					className="yoast-ad-logo-svg"
					width="64"
					height="64"
				/>
			</figure>
			<h2 className="yoast-ad-title nfd-title nfd-title--2 nfd-mt-6 nfd-text-xl nfd-font-semibold">
				Yoast SEO Premium
			</h2>
			<p className="nfd-mt-3 nfd-font-medium nfd-text-slate-800">
				Spend less time on SEO tasks!
			</p>
			<p className="nfd-mt-1 nfd-font-normal">
				Optimize your site faster, smarter, and with more confidence.
			</p>
			<ul className="nfd-list-outside nfd-text-slate-600 nfd-mt-4 nfd-flex nfd-flex-col nfd-gap-2">
				<li className="nfd-flex nfd-items-start">
					<BulletPointIcon />
					Create optimized SEO titles &amp; meta descriptions in
					seconds
				</li>
				<li className="nfd-flex nfd-items-start">
					<BulletPointIcon />
					Apply AI suggestions to improve content in 1 click
				</li>
				<li className="nfd-flex nfd-items-start">
					<BulletPointIcon />
					Manage redirects with ease and without extra plugins
				</li>
				<li className="nfd-flex nfd-items-start">
					<BulletPointIcon />
					Optimize pages for multiple keywords with guidance
				</li>
			</ul>
			<a
				className="nfd-button nfd-button--upsell nfd-flex nfd-justify-center nfd-gap-2 nfd-mt-4 focus:nfd-ring-offset-primary-500"
				href="https://yoa.st/jj?php_version=8.3&platform=wordpress&platform_version=6.9&software=free&software_version=26.8&days_active=3&user_language=en_US&screen=wpseo_dashboard"
				target="_blank"
				rel="noopener noreferrer"
				data-action="load-nfd-ctb"
				data-ctb-id="f6a84663-465f-4cb5-8ba5-f7a6d72224b2"
			>
				<span>Buy now</span>
				<ArrowRightIcon />
			</a>
			<p className="nfd-text-center nfd-text-xs nfd-font-normal nfd-leading-5 nfd-text-slate-500 nfd-italic nfd-mt-3 nfd-mb-2">
				Less friction. Faster publishing.
			</p>
			<hr className="nfd-border-t nfd-border-slate-200 nfd-my-4" />
			<ul className="nfd-text-center nfd-text-xs nfd-font-medium nfd-text-slate-800 nfd-list-none">
				<li>30-day money back guarantee</li>
				<li>24/7 support</li>
			</ul>
		</div>
	);
};
