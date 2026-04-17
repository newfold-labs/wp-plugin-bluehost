import './app/tailwind.pcss';
import './app/stylesheet.scss';

import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import LighthouseReport from './app/components/lighthouse-report';

const ROOT_ID = 'bluehost_lighthouse_report_widget_root';

domReady( () => {
	const el = document.getElementById( ROOT_ID );
	if ( ! el ) {
		return;
	}
	createRoot( el ).render( <LighthouseReport isDashboardWidget={ true } /> );
} );
