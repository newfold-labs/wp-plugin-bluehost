import { test, expect } from '@playwright/test';
import { auth, utils, wordpress } from '../helpers';

const TOGGLES = {
	tenwebAdminRestrictions: '[data-id="tenweb-admin-restrictions-toggle"]',
	tenwebEditorSupport: '[data-id="tenweb-editor-support-toggle"]',
};

const hasRegisteredFeature = async ( page, featureKey ) => {
	return page.evaluate(
		( key ) =>
			typeof window.NewfoldFeatures?.features?.[ key ] !== 'undefined',
		featureKey
	);
};

const isWvcThemeActive = async ( page ) => {
	return page.evaluate(
		() => Boolean( window.NewfoldRuntime?.wordpress?.isWvcTheme )
	);
};

const navigateToTenWebAdmin = async ( page ) => {
	await auth.navigateToAdminPage(
		page,
		'admin.php?page=bluehost#/admin'
	);
	await utils.waitForBluehostAppPage( page, {
		pageKebab: 'admin',
		contentSelector: '.wppbh-app-admin',
	} );
};

test.describe( 'TenWeb Admin Restrictions', () => {
	test.beforeAll( async () => {
		wordpress.resetThemeRestoreSlug();
		await wordpress.restoreDefaultTheme();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: false }
		);
	} );

	test.afterEach( async () => {
		await wordpress.restoreDefaultTheme();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: false }
		);
	} );

	test( 'TenWeb toggles are hidden when wvc-theme is not active', async ( {
		page,
	} ) => {
		await wordpress.restoreDefaultTheme();

		await navigateToTenWebAdmin( page );

		expect( await isWvcThemeActive( page ) ).toBe( false );

		if ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebAdminRestrictions )
			).toHaveCount( 0 );
		}

		if ( await hasRegisteredFeature( page, 'tenwebEditorSupport' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebEditorSupport )
			).toHaveCount( 0 );
		}
	} );

	test( 'TenWeb toggles appear when wvc-theme is active', async ( {
		page,
	} ) => {
		await wordpress.activateWvcThemeFixture();

		await navigateToTenWebAdmin( page );

		expect( await isWvcThemeActive( page ) ).toBe( true );

		if ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebAdminRestrictions )
			).toBeVisible( { timeout: 15000 } );
		}

		if ( await hasRegisteredFeature( page, 'tenwebEditorSupport' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebEditorSupport )
			).toBeVisible( { timeout: 15000 } );
		}
	} );

	test( 'plugins admin is blocked when restrictions are active', async ( {
		page,
	} ) => {
		await wordpress.activateWvcThemeFixture();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: true }
		);
		expect( await wordpress.getActiveThemeSlug() ).toBe( 'wvc-theme' );

		await auth.loginToWordPress( page );
		const response = await page.goto( '/wp-admin/plugins.php', {
			waitUntil: 'domcontentloaded',
		} );

		expect( response?.status() ).not.toBe( 200 );
		await expect( page.locator( '#menu-plugins' ) ).toHaveCount( 0 );
	} );

	test( 'unapproved plugin is deactivated on admin init', async ( {
		page,
	} ) => {
		await wordpress.activateWvcThemeFixture();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: true }
		);
		await wordpress.wpCli( 'plugin install hello-dolly --activate', {
			failOnNonZeroExit: true,
		} );

		await auth.navigateToAdminPage( page, 'index.php' );

		const status = await wordpress.getPluginStatus( 'hello-dolly' );
		expect( status ).toBe( 'inactive' );
	} );

	test( 'disabling tenwebAdminRestrictions restores plugins page access', async ( {
		page,
	} ) => {
		await wordpress.activateWvcThemeFixture();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: true }
		);

		await navigateToTenWebAdmin( page );

		test.skip(
			! ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ),
			'tenwebAdminRestrictions feature not registered'
		);

		const toggle = page.locator( TOGGLES.tenwebAdminRestrictions );
		await expect( toggle ).toBeVisible( { timeout: 15000 } );
		await utils.scrollIntoView( toggle );

		if ( await toggle.getAttribute( 'aria-checked' ) === 'true' ) {
			await toggle.click();
			await utils.waitForNotification(
				page,
				'10Web Admin Restrictions Disabled'
			);
		}

		await auth.navigateToAdminPage( page, 'plugins.php' );
		await expect( page ).toHaveURL( /\/wp-admin\/plugins\.php/ );
	} );
} );
