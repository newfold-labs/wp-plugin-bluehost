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

test.describe( 'TenWeb Admin Restrictions', () => {
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

		await auth.navigateToAdminPage(
			page,
			'admin.php?page=bluehost#/admin'
		);
		await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );

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

		await auth.navigateToAdminPage(
			page,
			'admin.php?page=bluehost#/admin'
		);
		await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );

		expect( await isWvcThemeActive( page ) ).toBe( true );

		if ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebAdminRestrictions )
			).toBeVisible();
		}

		if ( await hasRegisteredFeature( page, 'tenwebEditorSupport' ) ) {
			await expect(
				page.locator( TOGGLES.tenwebEditorSupport )
			).toBeVisible();
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

		await page.goto( '/wp-admin/plugins.php' );

		await expect( page ).toHaveURL( /\/wp-admin\/index\.php/ );
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

		await page.goto( '/wp-admin/' );
		await page.waitForSelector( '#wpadminbar', { timeout: 10000 } );

		const status = await wordpress.wpCli( 'plugin is-active hello-dolly' );
		expect( String( status ).trim() ).not.toBe( '1' );
	} );

	test( 'disabling tenwebAdminRestrictions restores plugins page access', async ( {
		page,
	} ) => {
		await wordpress.activateWvcThemeFixture();
		await wordpress.wpCli(
			'newfold features enable tenwebAdminRestrictions',
			{ failOnNonZeroExit: true }
		);

		await auth.navigateToAdminPage(
			page,
			'admin.php?page=bluehost#/admin'
		);
		await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );

		test.skip(
			! ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ),
			'tenwebAdminRestrictions feature not registered'
		);

		const toggle = page.locator( TOGGLES.tenwebAdminRestrictions );
		await utils.scrollIntoView( toggle );

		if ( await toggle.getAttribute( 'aria-checked' ) === 'true' ) {
			await toggle.click();
			await utils.waitForNotification(
				page,
				'10Web Admin Restrictions Disabled'
			);
		}

		await page.goto( '/wp-admin/plugins.php' );
		await expect( page ).toHaveURL( /\/wp-admin\/plugins\.php/ );
	} );
} );
