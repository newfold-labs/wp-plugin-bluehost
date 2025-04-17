/* Use PHP-provided URL to current version's build directory instead of root */
import './webpack-public-path';

import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import App from './app';

const WP_ADM_PAGE_ROOT_ELEMENT = 'wppbh-app';

// eslint-disable-next-line no-console
console.log(
	`%cWelcome to Bluehost!
%c
██████████████████████████████████████
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
██████████████████████████████████████
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
██████████████████████████████████████
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
███         ██          ██         ███
██████████████████████████████████████
`,
	'color: #196bde; font-size: 2em; font-weight: 900;',
	'background: #fff; color: #196bde; font-weight: 400;'
);

const WPPBHRender = () => {
	const DOM_ELEMENT = document.getElementById( WP_ADM_PAGE_ROOT_ELEMENT );
	if ( null !== DOM_ELEMENT ) {
		createRoot( DOM_ELEMENT ).render( <App /> );
	}
};

domReady( WPPBHRender );
