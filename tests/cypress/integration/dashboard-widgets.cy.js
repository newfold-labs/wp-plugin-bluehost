// <reference types="Cypress" />

describe( 'Dashboard Widgets', { testIsolation: true }, function () {
	before( () => {
		cy.clearCapabilities();
	} );
	after( () => {
		cy.clearCapabilities();
	} );

	beforeEach( () => {
		cy.wpLogin();
		cy.visit( '/wp-admin/index.php' );
	} );

	it( 'Bluehost Widgets are all Accessible', () => {
		cy.injectAxe();
		cy.get( '#dashboard-widgets-wrap', { timeout: 2000 } ).should(
			'exist'
		);
		cy.a11y( '#site_preview_widget' );
		cy.a11y( '#bluehost_help_widget' );
		cy.a11y( '#bluehost_account_widget' );
	} );

	it( 'Site Preview Widget', () => {
		cy.wpCli( 'option update nfd_coming_soon false' );
		cy.visit( '/wp-admin/index.php' );

		cy.get( '#site_preview_widget' ).should( 'exist' ).and( 'be.visible' );

		cy.get( '.iframe-preview-domain' )
			.contains( 'localhost' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '.iframe-preview-status' )
			.contains( 'Live' )
			.scrollIntoView()
			.should( 'be.visible' );

		cy.get( '.site-preview-widget-body' )
			.contains( 'website is live' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'data-coming-soon', 'false' );

		cy.get( '[data-cy="nfd-view-site"]' )
			.contains( 'View Site' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'localhost' ) ).to.be.true;
			} );

		cy.get( '[data-cy="nfd-edit-site"]' )
			.contains( 'Edit Site' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'site-editor' ) ).to.be.true;
			} );

		cy.get( '[data-cy="nfd-coming-soon-enable"]' )
			.contains( 'Enable Coming Soon' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href', '#' )
			.click(); // Enable Coming Soon

		// Coming Soon Enabled
		cy.get( 'a[title="Preview the coming soon landing page"]' )
			.scrollIntoView()
			.should( 'be.visible' );

		cy.get( '.iframe-preview-status' )
			.contains( 'Not Live' )
			.scrollIntoView()
			.should( 'be.visible' );

		cy.get( '.site-preview-widget-body' )
			.contains( 'Coming Soon' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'data-coming-soon', 'true' );

		cy.get( '[data-cy="nfd-coming-soon-enable"]' ).should( 'not.exist' );
		cy.get( '[data-cy="nfd-coming-soon-disable"]' )
			.contains( 'Launch Site' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href', '#' )
			.click(); // Launch Site

		// Coming Soon Disabled
		cy.get( 'a[title="Preview the coming soon landing page"]' ).should(
			'not.exist'
		);

		cy.get( '.iframe-preview-status' )
			.contains( 'Live' )
			.scrollIntoView()
			.should( 'be.visible' );

		cy.get( '.site-preview-widget-body' )
			.contains( 'website is live' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'data-coming-soon', 'false' );

		cy.get( '[data-cy="nfd-coming-soon-disable"]' ).should( 'not.exist' );
		cy.get( '[data-cy="nfd-coming-soon-enable"]' )
			.contains( 'Enable Coming Soon' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href', '#' );
	} );

	it( 'Help Widget', () => {
		cy.get( '#bluehost_help_widget' ).should( 'exist' ).and( 'be.visible' );

		// Help center not available by default without capabilities
		cy.get( '[data-cy="nfd-widget-help-link"]' )
			.contains( 'Get Help' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'data-help-center', 'false' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'help' ) ).to.be.true;
			} );

		// Set capabilities and check help center
		cy.task( 'log', 'Setting capabilities for help widget test' );
		cy.setCapability( {
			canAccessAI: true,
			canAccessHelpCenter: true,
		} );
		cy.reload();
		cy.get( '[data-cy="nfd-widget-help-link"]' )
			.contains( 'Get Help' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'data-help-center', 'true' )
			.click();
		cy.get( '#nfd-help-center' )
			.contains( 'Help' )
			.scrollIntoView()
			.should( 'exist' )
			.and( 'be.visible' );
	} );

	it( 'Bluehost Account Widget', () => {
		cy.get( '#bluehost_account_widget' )
			.should( 'exist' )
			.and( 'be.visible' );

		// Profile Link
		cy.get( '[data-cy="nfd-widget-account-link-profile"]' )
			.contains( 'Profile' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'bluehost' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Mail Link
		cy.get( '[data-cy="nfd-widget-account-link-email"]' )
			.contains( 'Mail' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'email-office' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Hosting Link
		cy.get( '[data-cy="nfd-widget-account-link-hosting"]' )
			.contains( 'Hosting' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'hosting' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );

		// Security Link
		cy.get( '[data-cy="nfd-widget-account-link-security"]' )
			.contains( 'Security' )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'href' )
			.then( ( href ) => {
				expect( href.includes( 'security' ) ).to.be.true;
				expect( href.includes( 'utm_source' ) ).to.be.true;
				expect( href.includes( 'utm_medium' ) ).to.be.true;
			} );
	} );
} );
