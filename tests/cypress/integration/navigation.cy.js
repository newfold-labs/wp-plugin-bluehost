// <reference types="Cypress" />

describe( 'Navigation', { testIsolation: true }, function () {
	beforeEach( () => {
		cy.wpLogin();
		cy.visit( '/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) );
	} );

	it( 'Logo Links to home', () => {
		cy.get( '.wppbh-logo-wrap a' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/home' );
	} );

	it( 'Admin submenu exists', () => {
		cy.visit( '/wp-admin/index.php' );
		cy.get( '#adminmenu #toplevel_page_bluehost ul.wp-submenu' ).should(
			'exist'
		);
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/home"]'
		).should( 'exist' );
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/settings"]'
		).should( 'exist' );
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/help"]'
		).should( 'exist' );
	} );

	// test main nav
	it( 'Settings link properly navigates', () => {
		cy.visit( '/wp-admin/index.php' );
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/settings"]'
		).click( { force: true } );
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/settings' );
	} );
} );
