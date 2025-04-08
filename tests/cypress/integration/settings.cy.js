// <reference types="Cypress" />

describe( 'Settings Page', { testIsolation: true }, function () {
	beforeEach( () => {
		cy.wpLogin();
		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/settings'
		);
	} );

	it( 'Is Accessible', () => {
		cy.injectAxe();
		cy.get( '.wppbh-app-settings-page', { timeout: 2000 } ).should(
			'exist'
		);
		cy.a11y( '.wppbh-app-body' );
	} );

	it( 'Has All Settings Sections', () => {
		cy.get( '.wppbh-app-settings-coming-soon' )
			.scrollIntoView()
			.should( 'be.visible' );
		// further tests exist in coming soon module
	} );

	it( 'Autoupdate Toggles function properly', () => {
		cy.get( '.wppbh-app-settings-update' )
			.scrollIntoView()
			.should( 'be.visible' );
		// On load update all is checked, which forces other updates to check and disabled state
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		//Disable ALL toggle, leaves everything checked, but enables them
		cy.get( '[data-id="autoupdate-all-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '.nfd-notifications' )
			.contains( 'p', 'Disabled All auto-updates' )
			.should( 'be.visible' );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );

		//Core toggle works
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-core-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '.nfd-notifications' )
			.contains( 'p', 'Disabled Core auto-updates' )
			.should( 'be.visible' );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		//Plugins toggle works
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '.nfd-notifications' )
			.contains( 'p', 'Disabled Plugins auto-update' )
			.should( 'be.visible' );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		// Themes toggle works
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '.nfd-notifications' )
			.contains( 'p', 'Disabled Themes auto-update' )
			.should( 'be.visible' );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		// All toggle activates all
		cy.get( '[data-id="autoupdate-all-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		// Disabling All toggle returns to previous state
		cy.get( '[data-id="autoupdate-all-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '.nfd-notifications' )
			.contains( 'p', 'Disabled All auto-updates' )
			.should( 'be.visible' );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'not.be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		// All Toggle takes over again when all are enabled
		cy.get( '[data-id="autoupdate-core-toggle"]' ).click();
		cy.get( '[data-id="autoupdate-plugins-toggle"]' ).click();
		cy.get( '[data-id="autoupdate-themes-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="autoupdate-all-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-core-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-plugins-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="autoupdate-themes-toggle"]' )
			.should( 'be.disabled' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
	} );

	it( 'Content Settings Work', () => {
		// Empty Trash Setting
		cy.get( '[data-id="empty-trash-select"]' ).click();
		cy.wait( 500 );
		cy.get( '[data-id="empty-trash-select"]' )
			.parent()
			.next( 'ul.nfd-select__options' )
			.find( 'li:nth-child(2)' )
			.click(); // 2
		cy.wait( 100 );
		cy.get( '#empty-trash-select__description' )
			.contains( 'The trash will automatically empty every 2 weeks.' )
			.should( 'be.visible' );

		cy.get( '[data-id="empty-trash-select"]' ).click();
		cy.wait( 500 );
		cy.get( '[data-id="empty-trash-select"]' )
			.parent()
			.next( 'ul.nfd-select__options' )
			.find( 'li:last' )
			.click(); // 4
		cy.wait( 100 );
		cy.get( '#empty-trash-select__description' )
			.contains( 'The trash will automatically empty every 4 weeks.' )
			.should( 'be.visible' );
	} );

	it( 'Comment Settings Work', () => {
		cy.get( '.wppbh-app-settings-comments' )
			.scrollIntoView()
			.should( 'be.visible' );
		cy.get( '[data-id="comments-per-page-select"]' ).click();
		cy.wait( 500 );
		cy.get( '[data-id="comments-per-page-select"]' )
			.parent()
			.next( 'ul.nfd-select__options' )
			.find( 'li:first' )
			.click(); // 10
		cy.wait( 100 );
		cy.get( '.wppbh-app-settings-comments' )
			.contains( 'label', 'Comments to display per page' )
			.should( 'be.visible' );

		cy.get( '[data-id="disable-comments-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="close-comments-days-select"]' ).should(
			'be.disabled'
		);
		cy.get( '[data-id="disable-comments-toggle"]' ).click();
		cy.wait( 100 );

		cy.get( '[data-id="disable-comments-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'true' );
		cy.get( '[data-id="close-comments-days-select"]' ).should(
			'not.be.disabled'
		);

		// Close comments after days
		cy.get( '[data-id="close-comments-days-select"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="close-comments-days-select"]' )
			.parent()
			.next( 'ul.nfd-select__options' )
			.find( 'li:last' )
			.click(); // 100
		cy.wait( 100 );
		cy.get( '.wppbh-app-settings-comments' )
			.contains( 'label', 'Comments to display per page' )
			.should( 'be.visible' );

		cy.get( '[data-id="close-comments-days-select"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="close-comments-days-select"]' )
			.parent()
			.next( 'ul.nfd-select__options' )
			.find( 'li:nth-child(6)' )
			.click(); // 14
		cy.wait( 100 );
		cy.get( '.wppbh-app-settings-comments' )
			.contains( 'label', 'Close comments after 14 days.' )
			.should( 'be.visible' );

		cy.get( '[data-id="disable-comments-toggle"]' ).click();
		cy.wait( 100 );
		cy.get( '[data-id="disable-comments-toggle"]' )
			.should( 'have.attr', 'aria-checked' )
			.and( 'include', 'false' );
		cy.get( '[data-id="close-comments-days-select"]' ).should(
			'be.disabled'
		);
	} );
} );
