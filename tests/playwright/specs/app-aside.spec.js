import { test, expect } from '@playwright/test';
import { auth, utils } from '../helpers';

const MAIN_APP_PAGES = [
	{ path: '/home', name: 'Home' },
	{ path: '/settings', name: 'Settings' },
	{ path: '/commerce', name: 'Commerce' },
	{ path: '/marketplace', name: 'Marketplace' },
	{ path: '/help', name: 'Help' },
];

test.describe('App Aside', () => {
	for ( const { path, name } of MAIN_APP_PAGES ) {
		test( `Aside is present on ${ name } page`, async ( { page } ) => {
			await auth.navigateToAdminPage( page, `admin.php?page=bluehost#${ path }` );
			await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );
			const aside = page.locator( '[data-test-id="app-aside"]' );
			await expect( aside ).toBeVisible();
		} );
	}

	test.describe( 'Aside content (home)', () => {
		test.beforeEach( async ( { page } ) => {
			await auth.navigateToAdminPage( page, 'admin.php?page=bluehost#/home' );
		} );

		test( 'Aside renders with expected structure', async ( { page } ) => {
			await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );
			const aside = page.locator( '[data-test-id="app-aside"]' );
			await utils.scrollIntoView( aside );
			await expect( aside ).toBeVisible();
			await expect( aside ).toHaveClass( /wppbh-app-aside/ );
			await expect( aside.locator( '.wppbh-app-aside-content' ) ).toBeVisible();
		} );

		test( 'Aside shows no Yoast ad (dynamic content only)', async ( { page } ) => {
			await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );
			const aside = page.locator( '[data-test-id="app-aside"]' );
			await utils.scrollIntoView( aside );
			await expect( aside ).toBeVisible();
			await expect( aside ).not.toContainText( 'Yoast SEO Premium' );
			await expect( aside ).not.toContainText( 'Buy now' );
		} );

		test( 'When Adam API returns items, aside shows adam cards', async ( {
			page,
		} ) => {
			await page.waitForSelector( '#wppbh-app-rendered', { timeout: 10000 } );
			const aside = page.locator( '[data-test-id="app-aside"]' );
			await utils.scrollIntoView( aside );
			await expect( aside ).toBeVisible();
			const adamCards = page.locator(
				'[data-test-id="app-aside-adam-card"]'
			);
			const count = await adamCards.count();
			if ( count > 0 ) {
				await expect( adamCards.first() ).toBeVisible();
			}
		} );
	} );
} );
