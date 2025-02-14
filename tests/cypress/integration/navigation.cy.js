// <reference types="Cypress" />

describe( 'Navigation', { testIsolation: true }, function () {
	beforeEach( () => {
		cy.wpLogin();
		cy.visit( '/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) );
	} );

	it( "Admin submenu shouldn't exist inside app", () => {
		cy.get( '#adminmenu #toplevel_page_bluehost ul.wp-submenu' ).should(
			'not.exist'
		);
	} );

	it( 'Logo Links to home', () => {
		cy.get( '.wppbh-logo-wrap' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/home' );
	} );

	// test main nav
	it( 'Main nav links properly navigates', () => {
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'not.have.class',
			'active'
		);
		cy.get( '.wppbh-app-navitem-marketplace' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/marketplace' );
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'have.class',
			'active'
		);

		cy.get( '.wppbh-app-navitem-performance' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/performance' );
		cy.get( '.wppbh-app-navitem-performance' ).should(
			'have.class',
			'active'
		);
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'not.have.class',
			'active'
		);

		cy.get( '.wppbh-app-navitem-settings' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/settings' );
	} );

	it( 'Subnav links properly navigates', () => {
		cy.get( '.wppbh-app-navitem-marketplace' )
			.scrollIntoView()
			.should( 'not.have.class', 'active' );
		cy.get( '.wppbh-app-navitem-marketplace' ).click();

		cy.wait( 500 );
		cy.hash().should( 'eq', '#/marketplace' );
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'have.class',
			'active'
		);

		cy.get( '.wppbh-app-subnavitem-services' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/marketplace/services' );
		cy.get( '.wppbh-app-subnavitem-services' ).should(
			'have.class',
			'active'
		);
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'have.class',
			'active'
		);

		cy.get( '.wppbh-app-subnavitem-seo' ).click();
		cy.wait( 500 );
		cy.hash().should( 'eq', '#/marketplace/seo' );
		cy.get( '.wppbh-app-subnavitem-seo' ).should( 'have.class', 'active' );
		cy.get( '.wppbh-app-subnavitem-services' ).should(
			'not.have.class',
			'active'
		);
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'have.class',
			'active'
		);

		cy.get( '.wppbh-app-navitem-performance' ).click();
		cy.wait( 500 );
		cy.get( '.wppbh-app-subnavitem-services' ).should(
			'not.have.class',
			'active'
		);
		cy.get( '.wppbh-app-subnavitem-seo' ).should(
			'not.have.class',
			'active'
		);
		cy.get( '.wppbh-app-navitem-marketplace' ).should(
			'not.have.class',
			'active'
		);
	} );

	it( 'Admin submenu exist outside the app', () => {
		cy.visit( '/wp-admin/index.php' );
		cy.get( '#adminmenu #toplevel_page_bluehost ul.wp-submenu' ).should(
			'exist'
		);
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/home"]'
		).should( 'exist' );
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/marketplace"]'
		).should( 'exist' );
		cy.get(
			'#adminmenu #toplevel_page_bluehost ul.wp-submenu li a[href="admin.php?page=bluehost#/settings"]'
		).should( 'exist' );
	} );

	it( 'Mobile nav links dispaly and link properly on mobile', () => {
		cy.get( '#nfd-app-mobile-nav' ).should( 'not.exist' );

		cy.viewport( 'iphone-x' );
		cy.get( '#nfd-app-mobile-nav' ).should( 'be.visible' );

		cy.get( '.wppbh-app-navitem-home' ).should( 'not.exist' );

		cy.get( '#nfd-app-mobile-nav' ).click();
		cy.wait( 500 );
		cy.get( '.wppbh-app-navitem-home' ).should( 'be.visible' );
		cy.get( 'button.nfd-modal__close-button' ).should( 'be.visible' );
		cy.get( 'button.nfd-modal__close-button' ).click();
		cy.get( '.wppbh-app-navitem-home' ).should( 'not.exist' );
	} );
} );
