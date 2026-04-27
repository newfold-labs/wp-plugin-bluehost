import { test, expect } from '@playwright/test';
import {
	wordpress,
	auth,
	navigateToHomePage,
	uninstallWooCommerce,
	isWooCommerceInstalled,
} from '../helpers/index.mjs';

test.describe( 'ECommerce Module', () => {
	test.beforeEach( async ( { page } ) => {
		// Apply WP-CLI state before any admin session so the home app does not boot with a
		// stale "store" site type. We do not clear Next Steps or Solutions data here—assertions
		// are scoped to the Bluehost home layout and the ecommerce quick-add mount only.
		await uninstallWooCommerce();
		await wordpress.setOption(
			'nfd_module_onboarding_site_info',
			`'{ "site_type": "personal" }' --format=json`
		);

		await auth.loginToWordPress( page );
	} );

	test.afterAll( async () => {
		await wordpress.wpCli( 'option delete nfd_module_onboarding_site_info' );
	} );

	/**
	 * "Add Store Details" for store sites is only rendered in the Bluehost home page title
	 * row (`src/app/pages/home/index.js`: `siteKind === 'store'`). Next Steps may reuse
	 * `data-store-info-trigger` elsewhere, so we scope to `.wppbh-home .nfd-home__title-section`
	 * only.
	 */
	test.describe( 'No Store - Store Info', () => {
		test( 'Store info section does not display', async ( { page } ) => {
			// check if woocommerce is installed
			if (await isWooCommerceInstalled()) {
				test.skip('WooCommerce is installed, cannot run non-ecommerce tests.');
			}

			const homeHeader = page.locator( '.wppbh-home .nfd-home__title-section' );
			const storeInfoCta = homeHeader.locator(
				'.nfd-button[data-store-info-trigger="true"]'
			);

			await navigateToHomePage( page );

			// Non-store copy in the home header (personal site_type → "website" in the title).
			await expect( homeHeader ).toContainText( /your website/i, { timeout: 20000 } );
			await expect( storeInfoCta ).not.toBeVisible( { timeout: 20000 } );
		} );
	} );

	/**
	 * Ecommerce "quick add product" UI is mounted in `#nfd-quick-add-product-widget` only
	 * (wp-module-ecommerce `QuickAddProduct` output). Next Steps may use the same
	 * `data-quick-add-product-trigger` on its own links; we only assert the ecommerce widget
	 * root has no such control.
	 */
	test.describe( 'No Woo - Quick Add Product', () => {
		test( 'Add product not visible', async ( { page } ) => {
			// check if woocommerce is active
			if (await isWooCommerceActive()) {
				test.skip('WooCommerce is still active, cannot run non-ecommerce tests.');
			}

			const homeHeader = page.locator( '.wppbh-home .nfd-home__title-section' );
			// Ecommerce module widget root (not Next Steps); empty when WC / hooks do not add it.
			const quickAddTrigger = page.locator(
				'#nfd-quick-add-product-widget .nfd-button[data-quick-add-product-trigger="true"]'
			);

			await navigateToHomePage( page );

			await expect( homeHeader ).toContainText( /your website/i, { timeout: 20000 } );
			await expect( quickAddTrigger ).toHaveCount( 0 );
		} );
	} );
} );
