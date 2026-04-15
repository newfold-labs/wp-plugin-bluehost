import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register( ArcElement, Tooltip, Legend );

/** Neutral ring track (unfilled portion) — distinct from tier center fill. */
const RING_TRACK = '#e8eaed';

/**
 * PageSpeed Insights–style tier colors (good / needs improvement / poor).
 * @see https://pagespeed.web.dev — gauge styling
 *
 * @param {number} value Score 0–100.
 * @return {{ stroke: string, fill: string }} Arc and light center-fill colors.
 */
const getPageSpeedTierColors = ( value ) => {
	const v = Math.max( 0, Math.min( 100, value ) );
	if ( v >= 90 ) {
		return { stroke: '#0cce6b', fill: '#e8f7ef' };
	}
	if ( v >= 50 ) {
		return { stroke: '#ffa400', fill: '#fff8e6' };
	}
	return { stroke: '#ff4e42', fill: '#ffebee' };
};

/**
 * Doughnut score gauge styled like Google PageSpeed Insights: colored progress arc on the outer ring,
 * neutral track for the remainder, light tier fill in the center (not covering the ring).
 *
 * @param {Object} props       Props.
 * @param {number} props.score Score 0–100.
 * @param {string} props.label Metric label.
 */
const ScoreGauge = ( { score, label } ) => {
	const clamped = Math.max( 0, Math.min( 100, Math.round( score ) ) );
	const { stroke, fill } = getPageSpeedTierColors( clamped );
	/** Inner radius as % of outer — higher = thinner ring (~½ thickness vs 78%). */
	const cutoutPct = '89%';
	/**
	 * Chart.js uses `startAngle = rotation° − 90°` (see DoughnutController _getRotation).
	 * So `rotation: 0` starts the first segment at 12 o’clock (not 3 o’clock).
	 */
	const rotationDeg = 0;

	const data = {
		datasets: [
			{
				data: [ clamped, 100 - clamped ],
				backgroundColor: [ stroke, RING_TRACK ],
				borderWidth: 0,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: cutoutPct,
		circumference: 360,
		rotation: rotationDeg,
		plugins: {
			legend: { display: false },
			tooltip: { enabled: false },
		},
		animation: {
			animateScale: true,
			animateRotate: true,
		},
	};

	return (
		<div className="nfd-flex nfd-flex-col nfd-items-center">
			<div className="nfd-relative nfd-mb-4 nfd-h-[60px] nfd-w-[60px]">
				<div className="nfd-relative nfd-z-[1] nfd-h-full nfd-w-full">
					<Doughnut data={ data } options={ options } />
				</div>
				{ /* Light tier fill only in the hole — keeps the outer progress arc fully visible */ }
				<div
					className="pointer-events-none nfd-absolute nfd-left-1/2 nfd-top-1/2 nfd-z-[5] nfd-aspect-square nfd--translate-x-1/2 nfd--translate-y-1/2 nfd-rounded-full"
					style={ {
						width: cutoutPct,
						height: cutoutPct,
						backgroundColor: fill,
					} }
					aria-hidden="true"
				/>
				<div className="nfd-pointer-events-none nfd-absolute nfd-inset-0 nfd-z-[10] nfd-flex nfd-items-center nfd-justify-center">
					<span
						className="nfd-text-xl nfd-font-semibold"
						style={ { color: stroke } }
					>
						{ clamped }
					</span>
				</div>
			</div>
			<span className="nfd-text-xs nfd-font-light nfd-tracking-wide nfd-text-gray-500 nfd-uppercase">
				{ label }
			</span>
		</div>
	);
};

export default ScoreGauge;
