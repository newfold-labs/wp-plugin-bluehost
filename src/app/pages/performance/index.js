import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, useContext, Fragment } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { Container, Page } from '@newfold/ui-component-library';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import AppStore from '../../data/store';
import {
	bluehostSettingsApiFetch as newfoldSettingsApiFetch,
	bluehostPurgeCacheApiFetch as newfoldPurgeCacheApiFetch,
} from 'App/util/helpers';
import { useNotification } from 'App/components/notifications';

import { default as NewfoldPerformance } from '@modules/wp-module-performance/components/performance/';

const PerformancePage = () => {
	// constants to pass to module
	const moduleConstants = {
		text: {
			cacheLevel0Description:
				__( 'No cache enabled.', 'wp-plugin-bluehost' ) +
				' ' +
				__( 'Every page load is fresh.', 'wp-plugin-bluehost' ) +
				' ',
			cacheLevel0Label: __( 'Disabled', 'wp-plugin-bluehost' ),
			cacheLevel0NoticeText:
				__( 'No cache enabled.', 'wp-plugin-bluehost' ) +
				' ' +
				__( 'Every page load is fresh.', 'wp-plugin-bluehost' ),
			cacheLevel0Recommendation: __(
				'Not recommended.',
				'wp-plugin-bluehost'
			),
			cacheLevel1Description:
				__(
					'Cache static assets like images and the appearance of your site for 1 hour.',
					'wp-plugin-bluehost'
				) + ' ',
			cacheLevel1Label: __( 'Assets Only', 'wp-plugin-bluehost' ),
			cacheLevel1NoticeText: __(
				'Cache enabled for assets only.',
				'wp-plugin-bluehost'
			),
			cacheLevel1Recommendation: __(
				'Recommended for ecommerce and sites that update frequently or display info in real-time.',
				'wp-plugin-bluehost'
			),
			cacheLevel2Description:
				__(
					'Cache static assets for 24 hours and web pages for 2 hours.',
					'wp-plugin-bluehost'
				) + ' ',
			cacheLevel2Label: __( 'Assets & Web Pages', 'wp-plugin-bluehost' ),
			cacheLevel2NoticeText: __(
				'Cache enabled for assets and pages.',
				'wp-plugin-bluehost'
			),
			cacheLevel2Recommendation: __(
				'Recommended for blogs, educational sites, and sites that update at least weekly.',
				'wp-plugin-bluehost'
			),
			cacheLevel3Description:
				__(
					'Cache static assets for 1 week and web pages for 8 hours.',
					'wp-plugin-bluehost'
				) + ' ',
			cacheLevel3Label: __(
				'Assets & Web Pages - Extended',
				'wp-plugin-bluehost'
			),
			cacheLevel3NoticeText: __(
				'Cache enabled for assets and pages (extended).',
				'wp-plugin-bluehost'
			),
			cacheLevel3Recommendation: __(
				'Recommended for sites that update a few times a month or less like porfolios or brochure sites.',
				'wp-plugin-bluehost'
			),
			cacheLevelDescription: __(
				'Boost speed and performance by storing a copy of your website content, files, and images online so the pages of your website load faster for your visitors.',
				'wp-plugin-bluehost'
			),
			cacheLevelNoticeTitle: __(
				'Cache setting saved',
				'wp-plugin-bluehost'
			),
			cacheLevelTitle: __( 'Cache Level', 'wp-plugin-bluehost' ),
			clearCacheButton: __( 'Clear All Cache Now', 'wp-plugin-bluehost' ),
			clearCacheDescription: __(
				"We automatically clear your cache as you work (creating content, changing settings, installing plugins and more). But you can manually clear it here to be confident it's fresh.",
				'wp-plugin-bluehost'
			),
			clearCacheNoticeTitle: __( 'Cache cleared', 'wp-plugin-bluehost' ),
			clearCacheTitle: __( 'Clear Cache', 'wp-plugin-bluehost' ),
			linkPrefetchDescription: __(
				'Asks the browser to download and cache links on the page ahead of them being clicked on, so that when they are clicked they load almost instantly.',
				'wp-plugin-bluehost'
			),
			linkPrefetchNoticeTitle: __(
				'Link prefetching setting saved',
				'wp-plugin-bluehost'
			),
			linkPrefetchTitle: __( 'Link Prefetch', 'wp-plugin-bluehost' ),
			linkPrefetchActivateOnDesktopDescription: __(
				'Enable link prefetching on desktop',
				'wp-plugin-bluehost'
			),
			linkPrefetchActivateOnDesktopLabel: __(
				'Activate on desktop',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorDescription: __(
				'Behavior of the prefetch',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorLabel: __( 'Behavior', 'wp-plugin-bluehost' ),
			linkPrefetchBehaviorMouseDownLabel: __(
				'Prefetch on Mouse Down',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMouseDownDescription: __(
				'Prefetch on Mouse Down: Starts loading the page as soon as you click down, for faster response when you release the click.',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMouseHoverLabel: __(
				'Prefetch on Mouse Hover (Recommended)',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMouseHoverDescription: __(
				'Prefetch on Mouse Hover: Begins loading the page the moment your cursor hovers over a link',
				'wp-plugin-bluehost'
			),
			linkPrefetchActivateOnMobileDescription: __(
				'Enable link prefetching on mobile',
				'wp-plugin-bluehost'
			),
			linkPrefetchActivateOnMobileLabel: __(
				'Activate on mobile',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMobileTouchstartLabel: __(
				'Prefetch on Touchstart (Recommended)',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMobileTouchstartDescription: __(
				'Prefetch on Touchstart: Instantly starts loading the page as soon as you tap the screen, ensuring a quicker response when you lift your finger.',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMobileViewportLabel: __(
				'Prefetch Above the Fold',
				'wp-plugin-bluehost'
			),
			linkPrefetchBehaviorMobileViewportDescription: __(
				"Prefetch Above the Fold: Loads links in your current view instantly, ensuring they're ready when you need them.",
				'wp-plugin-bluehost'
			),
			linkPrefetchIgnoreKeywordsDescription: __(
				'Exclude Keywords: A comma separated list of words or strings that will exclude a link from being prefetched. For example, excluding "app" will prevent https://example.com/apple from being prefetched.',
				'wp-plugin-bluehost'
			),
			linkPrefetchIgnoreKeywordsLabel: __(
				'Exclude keywords',
				'wp-plugin-bluehost'
			),
			performanceAdvancedSettingsTitle: __(
				'Advanced settings',
				'wp-plugin-bluehost'
			),
			performanceAdvancedSettingsDescription: __(
				'Additional speed and scalability features powered by Jetpack Boost to make your site as fast as it can be.',
				'wp-plugin-bluehost'
			),
			jetpackBoostCriticalCssTitle: __(
				'Optimize Critical CSS Loading (manual)',
				'wp-plugin-bluehost'
			),
			jetpackBoostCriticalCssDescription: __(
				'Move important styling information to the start of the page, which helps pages display your content sooner, so your users don’t have to wait for the entire page to load.',
				'wp-plugin-bluehost'
			),
			jetpackBoostCriticalCssPremiumTitle: __(
				'Optimize Critical CSS Loading (UPGRADED)',
				'wp-plugin-bluehost'
			),
			jetpackBoostCriticalCssUpgradeTitle: __(
				'Generate Critical CSS Automatically',
				'wp-plugin-bluehost'
			),
			jetpackBoostCriticalCssPremiumDescription: sprintf(
				// translators: %1$s is a line break (<br>), %2$s is the opening <strong> tag, %3$s is the closing </strong> tag.
				__(
					'Move important styling information to the start of the page, which helps pages display your content sooner, so your users don’t have to wait for the entire page to load.%1$s %2$sBoost will automatically generate your Critical CSS%3$s whenever you make changes to the HTML or CSS structure of your site.',
					'wp-plugin-bluehost'
				),
				'<br>',
				'<strong>',
				'</strong>'
			),
			jetpackBoostRenderBlockingTitle: __(
				'Defer Non-Essential JavaScript',
				'wp-plugin-bluehost'
			),
			jetpackBoostRenderBlockingDescription: __(
				'Run non-essential JavaScript after the page has loaded so that styles and images can load more quickly.',
				'wp-plugin-bluehost'
			),
			jetpackBoostMinifyJsTitle: __(
				'Concatenate JS',
				'wp-plugin-bluehost'
			),
			jetpackBoostMinifyJsDescription: __(
				'Scripts are grouped by their original placement, concatenated and minified to reduce site loading time and reduce the number of requests.',
				'wp-plugin-bluehost'
			),
			jetpackBoostExcludeJsTitle: __(
				'Exclude JS Strings',
				'wp-plugin-bluehost'
			),
			jetpackBoostMinifyCssTitle: __(
				'Concatenate CSS',
				'wp-plugin-bluehost'
			),
			jetpackBoostMinifyCssDescription: __(
				'Styles are grouped by their original placement, concatenated and minified to reduce site loading time and reduce the number of requests.',
				'wp-plugin-bluehost'
			),
			jetpackBoostExcludeCssTitle: __(
				'Exclude CSS Strings',
				'wp-plugin-bluehost'
			),
			jetpackBoostShowMore: __( 'Show more', 'wp-plugin-bluehost' ),
			jetpackBoostShowLess: __( 'Show less', 'wp-plugin-bluehost' ),
			jetpackBoostDicoverMore: __(
				'Discover More',
				'wp-plugin-bluehost'
			),
			jetpackBoostCtaText: __(
				'Install Jetpack Boost to unlock',
				'wp-plugin-bluehost'
			),
			jetpackBoostInstalling: __(
				'Installing Jetpack Boost…',
				'wp-plugin-bluehost'
			),
			jetpackBoostActivated: __(
				'Jetpack Boost is now active',
				'wp-plugin-bluehost'
			),
			jetpackBoostActivationFailed: __(
				'Activation failed',
				'wp-plugin-bluehost'
			),
			// translators: %1$s is the opening <a> tag, %2$s is the closing </a> tag.
			jetpackBoostDiscoverMore: __(
				'Discover more %1$shere%2$s',
				'wp-plugin-bluehost'
			),
			optionSet: __( 'Option saved correctly', 'wp-plugin-bluehost' ),
			optionNotSet: __( 'Error saving option', 'wp-plugin-bluehost' ),
			// Image Optimization
			imageOptimizationSettingsTitle: __(
				'Image Optimization',
				'wp-plugin-bluehost'
			),
			imageOptimizationSettingsDescription: __(
				'We automatically optimize your uploaded images to WebP format for faster performance and reduced file sizes. You can also choose to delete the original images to save storage space.',
				'wp-plugin-bluehost'
			),
			imageOptimizationEnabledLabel: __(
				'Enable Image Optimization',
				'wp-plugin-bluehost'
			),
			imageOptimizationEnabledDescription: __(
				'Enable or disable image optimization globally.',
				'wp-plugin-bluehost'
			),
			imageOptimizationAutoOptimizeLabel: __(
				'Automatically Optimize Uploaded Images',
				'wp-plugin-bluehost'
			),
			imageOptimizationAutoOptimizeDescription: __(
				'When enabled, all your new image uploads will be automatically optimized to WebP format, ensuring faster page loading and reduced file sizes.',
				'wp-plugin-bluehost'
			),
			imageOptimizationAutoDeleteLabel: __(
				'Auto Delete Original Image',
				'wp-plugin-bluehost'
			),
			imageOptimizationAutoDeleteDescription: __(
				'When enabled, the original uploaded image is deleted and replaced with the optimized version, helping to save storage space. If disabled, the optimized image is saved as a separate file, retaining the original.',
				'wp-plugin-bluehost'
			),
			imageOptimizationNoSettings: __(
				'No settings available.',
				'wp-plugin-bluehost'
			),
			imageOptimizationErrorMessage: __(
				'Oops! Something went wrong. Please try again.',
				'wp-plugin-bluehost'
			),
			imageOptimizationLoadingMessage: __(
				'Loading settings…',
				'wp-plugin-bluehost'
			),
			imageOptimizationUpdatedTitle: __(
				'Settings updated successfully',
				'wp-plugin-bluehost'
			),
			imageOptimizationUpdatedDescription: __(
				'Your image optimization settings have been saved.',
				'wp-plugin-bluehost'
			),
			imageOptimizationLazyLoadingLabel: __(
				'Enable Lazy Loading',
				'wp-plugin-bluehost'
			),
			imageOptimizationLazyLoadingDescription: __(
				'Lazy loading defers the loading of images until they are visible on the screen, improving page load speed and performance.',
				'wp-plugin-bluehost'
			),
			imageOptimizationLazyLoadingNoticeText: __(
				'Lazy loading has been updated.',
				'wp-plugin-bluehost'
			),
			imageOptimizationLazyLoadingErrorMessage: __(
				'Oops! There was an error updating the lazy loading settings.',
				'wp-plugin-bluehost'
			),
			imageOptimizationBulkOptimizeLabel: __(
				'Enable Bulk Optimization of Images',
				'wp-plugin-bluehost'
			),
			imageOptimizationBulkOptimizeDescription: __(
				'When enabled, allows bulk optimization of images in the media library.',
				'wp-plugin-bluehost'
			),
			imageOptimizationBulkOptimizeButtonLabel: __(
				'Go to Media Library',
				'wp-plugin-bluehost'
			),
			imageOptimizationUpdateErrorTitle: __(
				'Error Updating Settings',
				'wp-plugin-bluehost'
			),
			imageOptimizationPreferWebPLabel: __(
				'Prefer Optimized Image When Exists',
				'wp-plugin-bluehost'
			),
			imageOptimizationPreferWebPDescription: __(
				'When enabled, optimized images will be served in place of original images when they exist, improving performance.',
				'wp-plugin-bluehost'
			),
			imageOptimizationGenericErrorMessage: __(
				'Something went wrong while updating the settings. Please try again.',
				'wp-plugin-bluehost'
			),
		},
	};

	// methods to pass to module
	const moduleMethods = {
		apiFetch,
		useState,
		useEffect,
		useContext,
		NewfoldRuntime,
		useNotification,
		newfoldSettingsApiFetch,
		newfoldPurgeCacheApiFetch,
		useUpdateEffect,
		AppStore,
	};

	const moduleComponents = {
		Fragment,
	};

	return (
		<Page title="Performance" className={ 'wppbh-app-settings-page' }>
			<Container className={ 'wppbh-app-settings-container' }>
				<Container.Header
					title={ __( 'Performance', 'wp-plugin-bluehost' ) }
					description={ __(
						'This is where you can manage cache settings for your website.',
						'wp-plugin-bluehost'
					) }
					className={ 'wppbh-app-settings-header' }
				/>
				<NewfoldPerformance
					constants={ moduleConstants }
					methods={ moduleMethods }
					Components={ moduleComponents }
				/>
			</Container>
		</Page>
	);
};

export default PerformancePage;
