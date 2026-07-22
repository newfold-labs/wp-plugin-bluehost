import { test, expect } from '@playwright/test';
import { auth, utils } from '../helpers';

const TOGGLES = {
	staging: '#staging-toggle',
	performance: '#performance-toggle',
	tenwebAdminRestrictions: '#tenweb-admin-restrictions-toggle',
	tenwebEditorSupport: '#tenweb-editor-support-toggle',
};

const hasRegisteredFeature = async ( page, featureKey ) => {
	return page.evaluate(
		( key ) =>
			typeof window.NewfoldFeatures?.features?.[ key ] !== 'undefined',
		featureKey
	);
};

const expectToggleVisibility = async ( page, selector, registered ) => {
	const toggle = page.locator( selector );
	if ( registered ) {
		await expect( toggle ).toBeVisible();
	} else {
		await expect( toggle ).toHaveCount( 0 );
	}
};

const testToggleSuccessPath = async (
	page,
	{ selector, enabledTitle, disabledTitle, restoreTitleFragment }
) => {
	const toggle = page.locator( selector );
	const initial = await toggle.getAttribute( 'aria-checked' );

	await toggle.click();

	const expectedTitle = initial === 'true' ? disabledTitle : enabledTitle;
	await utils.waitForNotification( page, expectedTitle );
	await expect( toggle ).toHaveAttribute(
		'aria-checked',
		initial === 'true' ? 'false' : 'true'
	);

	// Restore initial state.
	await toggle.click();
	await utils.waitForNotification( page, restoreTitleFragment );
};

test.describe( 'Admin Feature Toggles', () => {
	test.beforeEach( async ( { page } ) => {
		await auth.navigateToAdminPage(
			page,
			'admin.php?page=bluehost#/admin'
		);
		await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );
		await page.waitForSelector( '.wppbh-app-admin', { timeout: 10000 } );
	} );

	test( 'Feature toggles render when features are registered', async ( {
		page,
	} ) => {
		const features = await page.evaluate(
			() => window.NewfoldFeatures?.features ?? {}
		);

		for ( const [ featureKey, selector ] of Object.entries( TOGGLES ) ) {
			await expectToggleVisibility(
				page,
				selector,
				typeof features[ featureKey ] !== 'undefined'
			);
		}
	} );

	test( 'Staging toggle success path', async ( { page } ) => {
		test.skip(
			! ( await hasRegisteredFeature( page, 'staging' ) ),
			'staging feature not registered'
		);

		await testToggleSuccessPath( page, {
			selector: TOGGLES.staging,
			enabledTitle: 'Staging Enabled',
			disabledTitle: 'Staging Disabled',
			restoreTitleFragment: 'Staging',
		} );
	} );

	test( 'Performance toggle success path', async ( { page } ) => {
		test.skip(
			! ( await hasRegisteredFeature( page, 'performance' ) ),
			'performance feature not registered'
		);

		await testToggleSuccessPath( page, {
			selector: TOGGLES.performance,
			enabledTitle: 'Performance Enabled',
			disabledTitle: 'Performance Disabled',
			restoreTitleFragment: 'Performance',
		} );
	} );

	test( 'TenWeb admin restrictions toggle success path', async ( {
		page,
	} ) => {
		test.skip(
			! ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ),
			'tenwebAdminRestrictions feature not registered'
		);

		await testToggleSuccessPath( page, {
			selector: TOGGLES.tenwebAdminRestrictions,
			enabledTitle: '10Web Admin Restrictions Enabled',
			disabledTitle: '10Web Admin Restrictions Disabled',
			restoreTitleFragment: '10Web Admin Restrictions',
		} );
	} );

	test( 'TenWeb admin restrictions toggle failure path', async ( {
		page,
	} ) => {
		test.skip(
			! ( await hasRegisteredFeature( page, 'tenwebAdminRestrictions' ) ),
			'tenwebAdminRestrictions feature not registered'
		);

		await page.route( '**/newfold-features/v1/feature/**', ( route ) => {
			route.fulfill( {
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify( {
					code: 'nfd_features_error',
					message: 'Cannot modify this feature.',
				} ),
			} );
		} );

		const toggle = page.locator( TOGGLES.tenwebAdminRestrictions );
		const initial = await toggle.getAttribute( 'aria-checked' );

		await toggle.click();
		await utils.waitForNotification( page, 'Sorry, that is not allowed.' );
		await expect( toggle ).toHaveAttribute( 'aria-checked', initial );
		await expect( toggle ).toBeDisabled();
	} );
} );
