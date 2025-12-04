import { test, expect } from '@playwright/test';
import { auth } from '../helpers';

test.describe('Version Check', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to WordPress site health page
    await auth.navigateToAdminPage(page, 'site-health.php?tab=debug');
  });

  test('Is running the correct WP version', async ({ page }) => {
    // Click to expand the WordPress core section
    await page.locator('#health-check-accordion-block-wp-core').locator('..').first().click();
    
    // Wait for the accordion to expand
    await page.waitForTimeout(500);
    
    // Check the WordPress version in the first row
    const versionCell = page.locator('#health-check-accordion-block-wp-core')
      .locator('tr')
      .first()
      .locator('td')
      .last();
    
    // Get the expected WordPress version from environment or use default
    const expectedVersion = process.env.WP_VERSION;
    const versionText = await versionCell.textContent();
    
    expect(versionText).toMatch(new RegExp(`^${expectedVersion}`));
  });

  test('Is running the correct PHP versions', async ({ page }) => {
    // Click to expand the WordPress server section
    await page.locator('#health-check-accordion-block-wp-server').locator('..').first().click();
    
    // Wait for the accordion to expand
    await page.waitForTimeout(500);
    
    // Check the PHP version in the third row (index 2)
    const phpVersionCell = page.locator('#health-check-accordion-block-wp-server')
      .locator('tr')
      .nth(2)
      .locator('td')
      .last();
    
    // Get the expected PHP version from environment or use default
    const expectedPhpVersion = process.env.PHP_VERSION;
    const phpVersionText = await phpVersionCell.textContent();
    
    expect(phpVersionText).toContain(expectedPhpVersion);
  });
});
