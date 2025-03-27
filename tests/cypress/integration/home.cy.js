// <reference types="Cypress" />
const webinarsFixture = require( '../fixtures/webinars.json' );
const webinarsPastFixture = require( '../fixtures/webinars-past.json' );
const webinarsInactiveFixture = require( '../fixtures/webinars-inactive.json' );

describe( 'Home Page', { testIsolation: true }, function () {
	let NewfoldRuntime;

	beforeEach( () => {
		cy.wpLogin();
		cy.visit(
			'/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) + '#/home'
		);
		cy.window()
			.its( 'NewfoldRuntime' )
			.then( ( data ) => {
				NewfoldRuntime = data;
			} );
	} );

	it( 'Is Accessible', () => {
		cy.injectAxe();
		cy.wait( 500 );
		cy.a11y( '.wppbh-app-body' );
	} );

	it( 'Welcome Section Exists', () => {
		cy.get( '.nfd-app-section-container' )
			.contains( 'h2', 'Home' )
			.scrollIntoView()
			.should( 'be.visible' );
	} );

	it( 'Solution Card Exists', () => {
		cy.get( '[data-cy="solution-card"]' )
			.contains( 'h2', 'Solution' )
			.scrollIntoView()
			.should( 'be.visible' );
	} );

	it( 'Help Card Exists', () => {
		cy.get( '[data-cy="help-card"]' )
			.contains( 'h3', 'Help' )
			.scrollIntoView()
			.should( 'be.visible' );
	} );

} );
