import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const getLatestScan = ( scans ) => {
	if ( ! Array.isArray( scans ) || scans.length === 0 ) {
		return null;
	}
	return scans.reduce( ( latest, current ) =>
		new Date( latest.updatedAt ) > new Date( current.updatedAt )
			? latest
			: current
	);
};

const getInitialFromWindow = () => {
	if ( typeof window === 'undefined' || ! window.NFD_INSIGHTS_HOME ) {
		return { isRunningScan: false };
	}
	return {
		isRunningScan: window.NFD_INSIGHTS_HOME.isRunningScan === true,
	};
};

/**
 * Fetches performance scans (with polling) and tracks scan-in-progress, matching wp-module-insights InsightsContext + useScans.
 *
 * @param {number} [pollingInterval] Poll interval in ms.
 */
export function useLighthouseInsights( pollingInterval = 120000 ) {
	const [ scans, setScans ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ isRunningScan, setIsRunningScan ] = useState(
		getInitialFromWindow().isRunningScan
	);
	const prevLatestScan = useRef( null );

	const fetchScans = useCallback( async () => {
		try {
			const fetched = await apiFetch( {
				path: '/newfold-insights/v1/performance-scans',
			} );
			// REST returns a JSON array of scans; empty body / non-array → no scans (show Run Scan UI).
			setScans( Array.isArray( fetched ) ? fetched : [] );
		} catch {
			setScans( [] );
		} finally {
			setLoading( false );
		}
	}, [] );

	useEffect( () => {
		fetchScans();
		const timer = setInterval( fetchScans, pollingInterval );
		return () => clearInterval( timer );
	}, [ fetchScans, pollingInterval ] );

	const latestScan = getLatestScan( scans );

	useEffect( () => {
		if ( prevLatestScan.current === null ) {
			prevLatestScan.current = latestScan;
			return;
		}
		if (
			prevLatestScan.current?.createdAt &&
			latestScan?.createdAt &&
			new Date( prevLatestScan.current.createdAt ).valueOf() <
				new Date( latestScan.createdAt ).valueOf()
		) {
			prevLatestScan.current = latestScan;
			setIsRunningScan( false );
		}
	}, [ latestScan ] );

	return {
		latestScan,
		loading,
		isRunningScan,
		setIsRunningScan,
		refetch: fetchScans,
	};
}
