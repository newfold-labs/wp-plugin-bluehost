import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Spinner } from '@newfold/ui-component-library';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import apiFetch from '@wordpress/api-fetch';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import {
	LighthouseLogoIcon,
	EmptyStateInsightsIcon,
} from 'App/components/icons';
import ScoreGauge from './ScoreGauge';
import { useLighthouseInsights } from './useLighthouseInsights';

/**
 * Tools → Site Insights screen (`tools.php?page=nfd-insights`).
 * `NewfoldRuntime.adminUrl` from `@newfold/wp-module-runtime` is a function `(path) => window.NewfoldRuntime.admin_url + path`, not a string — do not interpolate it in template literals.
 *
 * @param {Object|null} insightsHome `window.NFD_INSIGHTS_HOME` when localized.
 * @return {string} Full admin URL.
 */
const getInsightsToolsPageUrl = ( insightsHome ) => {
	if ( typeof NewfoldRuntime?.adminUrl === 'function' ) {
		return NewfoldRuntime.adminUrl( 'tools.php?page=nfd-insights' );
	}
	const base =
		insightsHome?.adminUrl ||
		( typeof window !== 'undefined' && window.NewfoldRuntime?.admin_url ) ||
		'/wp-admin/';
	const normalized = base.endsWith( '/' ) ? base : `${ base }/`;
	return `${ normalized }tools.php?page=nfd-insights`;
};

/**
 * Same behavior as wp-module-insights `useTriggerScan` (POST run-scan, spinner, lock while scan pending).
 *
 * @param {boolean}  isRunningScan    Scan lock / in-progress from Insights repository + local state.
 * @param {Function} setIsRunningScan
 * @param {Function} [refetchScans]   Optional: call after successful POST to pull new data sooner than poll interval.
 */
const useTriggerScan = ( isRunningScan, setIsRunningScan, refetchScans ) => {
	const [ isTryingToRun, setIsTryingToRun ] = useState( false );

	const triggerScan = async () => {
		if ( ! isTryingToRun && ! isRunningScan ) {
			try {
				setIsTryingToRun( true );
				await apiFetch( {
					path: '/newfold-insights/v1/performance-scans/run-scan',
					method: 'POST',
				} );
				setIsRunningScan( true );
				if ( typeof refetchScans === 'function' ) {
					refetchScans();
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Error triggering scan:', error );
			} finally {
				setIsTryingToRun( false );
			}
		}
	};

	return { triggerScan, isTryingToRun };
};

const LighthouseReportEmpty = ( {
	isRunningScan,
	triggerScan,
	isTryingToRun,
} ) => (
	<>
		<div className="nfd-flex nfd-flex-col nfd-items-center nfd-justify-center nfd-py-2 nfd-text-center nfd--mt-8">
			<EmptyStateInsightsIcon className="nfd-min-w-[200px] nfd-max-w-[300px] nfd-w-[40%]" />
			<h3 className="nfd-mb-1 nfd-mt-8 nfd-text-base nfd-font-medium nfd-text-gray-900">
				{ isRunningScan
					? __(
							'Your report is being generated',
							'wp-plugin-bluehost'
					  )
					: __( 'No insights yet.', 'wp-plugin-bluehost' ) }
			</h3>
			<p className="nfd-mt-1 nfd-max-w-lg nfd-text-sm nfd-text-gray-500">
				{ isRunningScan
					? __(
							'This usually takes a few minutes. You can refresh or come back later, results will show up once ready.',
							'wp-plugin-bluehost'
					  )
					: __(
							'Run your first test to generate performance, accessibility, and SEO data.',
							'wp-plugin-bluehost'
					  ) }
			</p>
		</div>
		<div className="nfd-mb-4 nfd-mt-2 nfd-flex nfd-justify-center">
			<Button
				onClick={ triggerScan }
				className={ classNames(
					'nfd-flex nfd-items-center nfd-gap-2 nfd-rounded-md nfd-border-0 nfd-bg-gray-900 nfd-px-6 nfd-py-3 nfd-text-sm nfd-font-medium nfd-text-white',
					{
						'nfd-opacity-50': isTryingToRun || isRunningScan,
						'nfd-cursor-pointer hover:nfd-bg-gray-800 focus:nfd-outline-none focus:nfd-ring-2 focus:nfd-ring-offset-2 focus:nfd-ring-gray-900':
							! ( isTryingToRun || isRunningScan ),
						'nfd-cursor-progress nfd-pl-3': isTryingToRun,
						'nfd-cursor-not-allowed': isRunningScan,
					}
				) }
			>
				{ isTryingToRun && <Spinner /> }
				{ __( 'Run Scan', 'wp-plugin-bluehost' ) }
			</Button>
		</div>
	</>
);

const LighthouseReportWithData = ( { report, insightsPageUrl } ) => {
	const scores = [
		{
			label: __( 'Performance', 'wp-plugin-bluehost' ),
			score: Math.round( report.performanceScore * 100 ),
		},
		{
			label: __( 'Accessibility', 'wp-plugin-bluehost' ),
			score: Math.round( report.accessibilityScore * 100 ),
		},
		{
			label: __( 'Best Practices', 'wp-plugin-bluehost' ),
			score: Math.round( report.bestPracticesScore * 100 ),
		},
		{
			label: __( 'SEO', 'wp-plugin-bluehost' ),
			score: Math.round( report.seoScore * 100 ),
		},
	];

	const lastChecked = report.createdAt || report.updatedAt;

	return (
		<div>
			<div className="nfd-mb-8 nfd-grid nfd-grid-cols-2 nfd-gap-8 md:nfd-grid-cols-4">
				{ scores.map( ( item, index ) => (
					<ScoreGauge key={ index } { ...item } />
				) ) }
			</div>

			<div className="nfd-mb-8 nfd-flex nfd-flex-wrap nfd-items-center nfd-justify-center nfd-gap-6 nfd-text-sm nfd-text-gray-500">
				<div className="nfd-flex nfd-items-center nfd-gap-2">
					<span className="nfd-h-3 nfd-w-3 nfd-rounded-full nfd-bg-[#0cce6b]"></span>
					<span>{ __( 'Good:', 'wp-plugin-bluehost' ) } &gt; 90</span>
				</div>
				<div className="nfd-flex nfd-items-center nfd-gap-2">
					<span className="nfd-h-3 nfd-w-3 nfd-rounded-full nfd-bg-[#ffa400]"></span>
					<span>
						{ __(
							'Needs Improvement: 50 – 89',
							'wp-plugin-bluehost'
						) }
					</span>
				</div>
				<div className="nfd-flex nfd-items-center nfd-gap-2">
					<span className="nfd-h-3 nfd-w-3 nfd-rounded-full nfd-bg-[#ff4e42]"></span>
					<span>{ __( 'Poor:', 'wp-plugin-bluehost' ) } &lt; 50</span>
				</div>
				<div className="nfd-flex nfd-items-center nfd-gap-2">
					<span className="nfd-h-3 nfd-w-3 nfd-rounded-full nfd-bg-[#AEB9C6]"></span>
					<span>{ __( 'No Data', 'wp-plugin-bluehost' ) }</span>
				</div>
			</div>

			<div className="nfd-flex nfd-w-full nfd-flex-row nfd-items-center nfd-justify-between nfd-gap-4">
				<span className="nfd-min-w-0 nfd-flex-1 nfd-text-sm nfd-text-gray-500">
					{ sprintf(
						/* translators: %s: formatted date/time */
						__( 'Last checked %s', 'wp-plugin-bluehost' ),
						new Date( lastChecked ).toLocaleString()
					) }
				</span>
				<a
					href={ insightsPageUrl }
					className="nfd-inline-flex nfd-shrink-0 nfd-items-center nfd-justify-center nfd-gap-1 nfd-rounded-md nfd-border-[2px] nfd-border-solid nfd-border-[#D1D5DC] nfd-bg-white nfd-px-4 nfd-py-2 nfd-text-sm nfd-font-medium nfd-text-gray-900 nfd-no-underline hover:nfd-bg-gray-100 focus:nfd-outline-none focus:nfd-ring-2 focus:nfd-ring-gray-100 focus:nfd-ring-offset-2"
				>
					{ __( 'Open Site Insights', 'wp-plugin-bluehost' ) }
					<ArrowTopRightOnSquareIcon width={ 18 } />
				</a>
			</div>
		</div>
	);
};

/**
 * Same Lighthouse Report block as Tools → Site Insights (wp-module-insights), for Bluehost Home and the dashboard widget.
 */
const LighthouseReport = () => {
	const insightsHome =
		typeof window !== 'undefined' ? window.NFD_INSIGHTS_HOME : null;
	const canScan =
		window.NewfoldRuntime?.capabilities?.canScanPerformance === true ||
		insightsHome?.canScanPerformance === true;

	const {
		latestScan: report,
		loading,
		isRunningScan,
		setIsRunningScan,
		refetch: refetchScans,
	} = useLighthouseInsights();

	const { triggerScan, isTryingToRun } = useTriggerScan(
		isRunningScan,
		setIsRunningScan,
		refetchScans
	);

	if ( ! canScan ) {
		return null;
	}

	const insightsPageUrl = getInsightsToolsPageUrl( insightsHome );

	return (
		<div
			className="nfd-mb-6 nfd-rounded-lg nfd-border nfd-border-gray-200 nfd-bg-white nfd-p-6 nfd-shadow-sm"
			data-cy="lighthouse-report-section"
			data-test-id="lighthouse-report-section"
		>
			<div className="nfd-mb-8 nfd-flex nfd-items-center nfd-gap-2">
				<LighthouseLogoIcon className="nfd-h-6 nfd-w-6" />
				<h2 className="nfd-text-lg nfd-font-semibold nfd-text-gray-900">
					{ __( 'Lighthouse Report', 'wp-plugin-bluehost' ) }
				</h2>
			</div>

			{ loading && (
				<div className="nfd-p-6 nfd-text-center">
					{ __( 'Loading…', 'wp-plugin-bluehost' ) }
				</div>
			) }

			{ ! loading && ! report && (
				<LighthouseReportEmpty
					isRunningScan={ isRunningScan }
					isTryingToRun={ isTryingToRun }
					triggerScan={ triggerScan }
				/>
			) }

			{ ! loading && report && (
				<LighthouseReportWithData
					report={ report }
					insightsPageUrl={ insightsPageUrl }
				/>
			) }
		</div>
	);
};

export default LighthouseReport;
