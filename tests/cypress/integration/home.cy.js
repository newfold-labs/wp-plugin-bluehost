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

	it( 'Home Page Section and Cards all exist', () => {
		// Welcome text
		cy.get( '.wppbh-app-body' )
			.contains( 'h1', 'Welcome to Bluehost' )
			.scrollIntoView()
			.should( 'be.visible' );

		// Home Section
		cy.get( '#nfd-app-section-home' )
			.scrollIntoView()
			.should( 'be.visible' );

		// Solution Card
		cy.get( '[data-cy="solution-card"]' )
			.contains( 'h2', 'Explore' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="solution-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'solutions' ) ).to.be.true;
			} );

		// Expert Card
		cy.get( '[data-cy="expert-card"]' )
			.contains( 'h3', 'experts' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="expert-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'website-design' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Help Card
		cy.get( '[data-cy="help-card"]' )
			.contains( 'h3', 'Help' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="help-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'help' ) ).to.be.true;
			} );

		// Pro Design Card
		cy.get( '[data-cy="pro-design-card"]' )
			.contains( 'h3', 'Pro' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="pro-design-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'market-place' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Referral Program Card
		cy.get( '[data-cy="referral-program-card"]' )
			.contains( 'h3', 'Refer' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="referral-program-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'affiliates' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Quick Link Cards
		cy.get( '[data-cy="quick-links-card"]' )
			.contains( 'h3', 'Quick' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="hosting-card"]' )
			.contains( 'Manage hosting' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="hosting-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'hosting' ) ).to.be.true;
			} );
		cy.get( '[data-cy="blog-card"]' )
			.contains( 'blog' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="blog-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'post-new' ) ).to.be.true;
				expect( href.includes( 'wb-library=patterns' ) ).to.be.true;
			} );
		cy.get( '[data-cy="promotion-card"]' )
			.contains( 'sale promotion' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-cy="promotion-card"]' )
			.should( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'store/sales_discounts' ) ).to.be.true;
			} );
	} );
} );
