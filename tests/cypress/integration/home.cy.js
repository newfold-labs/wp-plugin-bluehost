// <reference types="Cypress" />

describe( 'Home Page', { testIsolation: true }, function () {
	beforeEach( () => {
		cy.wpLogin();
		cy.visit(
			'/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) + '#/home'
		);
	} );

	it( 'Is Accessible', () => {
		cy.injectAxe();
		cy.get( '.wppbh-home', { timeout: 2000 } ).should( 'exist' );
		cy.a11y( '.wppbh-app-body' );
	} );

	it( 'Welcome Section Exists', () => {
		cy.get( '#nfd-app-section-home' )
			.contains( 'h1', 'Ready to go to the next level?' )
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
