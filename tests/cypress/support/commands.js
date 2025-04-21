// <reference types="Cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

Cypress.Commands.add( 'login', ( username, password ) => {
	cy.getCookies().then( ( cookies ) => {
		let hasMatch = false;
		cookies.forEach( ( cookie ) => {
			if ( cookie.name.substr( 0, 20 ) === 'wordpress_logged_in_' ) {
				hasMatch = true;
			}
		} );
		if ( ! hasMatch ) {
			cy.visit( '/wp-login.php' ).wait( 1000 );
			cy.get( '#user_login' ).type( username );
			cy.get( '#user_pass' ).type( `${ password }{enter}` );

			// Speed up tests by setting permalink structure once
			// cy.setPermalinkStructure();
		}
	} );
} );

Cypress.Commands.add( 'wpLogin', () => {
	cy.login( Cypress.env( 'wpUsername' ), Cypress.env( 'wpPassword' ) );
} );

Cypress.Commands.add( 'logout', () => {
	cy.getCookies().then( ( cookies ) => {
		cookies.forEach( ( cookie ) => {
			cy.clearCookie( cookie.name );
		} );
	} );
} );

Cypress.Commands.add(
	'setPermalinkStructure',
	( structure = '/%postname%/' ) => {
		cy.request( {
			method: 'GET',
			url: '/wp-json/',
			failOnStatusCode: false,
		} ).then( ( result ) => {
			if ( result.isOkStatusCode ) {
				return;
			}
			const permalinkWpCliCommand = `wp rewrite structure "${ structure }" --hard;`;
			const permalinkWpEnvCommand = `npx wp-env run cli ${ permalinkWpCliCommand }`;
			const permalinkWpEnvTestCommand = `npx wp-env run tests-cli ${ permalinkWpCliCommand }`;
			cy.exec( permalinkWpEnvCommand, { failOnNonZeroExit: false } ).then(
				( result ) => {
					cy.request( '/wp-json/' );
				}
			);
			cy.exec( permalinkWpEnvTestCommand, {
				failOnNonZeroExit: false,
			} ).then( ( result ) => {
				cy.request( '/wp-json/' );
			} );
		} );
	}
);

Cypress.Commands.add( 'deletePages', () => {
	cy.visit( '/wp-admin/edit.php?post_type=page' ).wait( 1000 );
	cy.get( 'body' ).then( ( $body ) => {
		// synchronously ask for the body's text
		// and do something based on whether it includes
		// another string
		if ( $body.text().includes( 'No pages found.' ) ) {
			// nothing needed
		} else {
			cy.get( '#cb-select-all-1' ).check();
			cy.get( '#bulk-action-selector-top' ).select( 'trash' );
			cy.get( '#doaction' ).click();
			cy.wait( 2000 );
			cy.get( '.subsubsub .trash' ).click();
			cy.wait( 2000 );
			cy.get( '#delete_all' ).click();
		}
	} );
} );

// Print cypress-axe violations to the terminal
function printAccessibilityViolations( violations ) {
	cy.task(
		'log',
		`${ violations.length } accessibility violation${
			violations.length === 1 ? '' : 's'
		} ${ violations.length === 1 ? 'was' : 'were' } detected`
	);
	// pluck specific keys to keep the table readable
	const violationData = violations.map(
		( { id, impact, description, nodes } ) => ( {
			id,
			impact,
			description,
			nodes: nodes.length,
		} )
	);

	cy.task( 'table', violationData );
}

Cypress.Commands.add( 'a11y', ( context ) => {
	cy.checkA11y( context, null, printAccessibilityViolations, false );
} );

/**
 * wp-cli helper
 *
 * This wraps the command in the required npx wp-env run cli wp
 *
 * @param {string} cmd               the command to send to wp-cli
 * @param          failOnNonZeroExit
 */
Cypress.Commands.add( 'wpCli', ( cmd, failOnNonZeroExit = true ) => {
	const args = {
		env: {
			NODE_TLS_REJECT_UNAUTHORIZED: '1',
		},
	};
	if ( ! failOnNonZeroExit ) {
		args.failOnNonZeroExit = false;
	}
	cy.exec( `npx wp-env run cli wp ${ cmd }`, args ).then( ( result ) => {
		for ( const [ key, value ] of Object.entries( result ) ) {
			cy.log( `${ key }: ${ value }` );
		}
	} );
} );

/**
 * Set capability helper
 *
 * This calls performs a cli command to set a specific capability
 *
 * @param {*}      capJSON    json of capabilities
 * @param {number} expiration seconds for transient to expire, defualt 3600 (1 hour)
 */
Cypress.Commands.add( 'setCapability', ( capJSON, expiration = 3600 ) => {
	cy.wpCli(
		`option update _transient_nfd_site_capabilities '${ JSON.stringify(
			capJSON
		) }' --format=json`
	);
	// set transient expiration to one hour (default) from now
	const expiry = Math.floor( new Date().getTime() / 1000.0 ) + expiration;
	// manually set expiration for the transients
	cy.wpCli(
		`option update _transient_timeout_nfd_site_capabilities ${ expiry }`
	);
} );

/**
 * Clear capabilities
 */
Cypress.Commands.add( 'clearCapabilities', () => {
	cy.wpCli( `option delete _transient_nfd_site_capabilities` );
} );
