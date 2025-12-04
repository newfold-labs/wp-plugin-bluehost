import { test, expect } from '@playwright/test';
import { auth, a11y, utils } from '../helpers';

test.describe('Settings Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await auth.navigateToAdminPage(page, 'admin.php?page=bluehost#/settings/settings');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for the main app container to be rendered
    await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
    
    // Wait for the app body to be visible
    await page.waitForSelector('.wppbh-app-body', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wppbh-app-body');
  });

  test('Has Coming Soon Section', async ({ page }) => {
    const comingSoonSection = page.locator('.wppbh-app-settings-coming-soon');
    await utils.scrollIntoView(comingSoonSection);
    await expect(comingSoonSection).toBeVisible();
    // further tests exist in coming soon module
  });

  test('Autoupdate Toggles function properly', async ({ page }) => {
    const updatesSection = page.locator('.wppbh-app-settings-update');
    await utils.scrollIntoView(updatesSection);
    await expect(updatesSection).toBeVisible();

    // On load update all is checked, which forces other updates to check and disabled state
    const allToggle = page.locator('[data-id="autoupdate-all-toggle"]');
    await expect(allToggle).toHaveAttribute('aria-checked', 'true');

    const coreToggle = page.locator('[data-id="autoupdate-core-toggle"]');
    await expect(coreToggle).toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'true');

    const pluginsToggle = page.locator('[data-id="autoupdate-plugins-toggle"]');
    await expect(pluginsToggle).toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'true');

    const themesToggle = page.locator('[data-id="autoupdate-themes-toggle"]');
    await expect(themesToggle).toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'true');

    // Disable ALL toggle, leaves everything checked, but enables them
    await allToggle.click();
    await page.waitForTimeout(100);
    
    await utils.waitForNotification(page, 'Disabled All auto-updates');
    await expect(allToggle).toHaveAttribute('aria-checked', 'false');
    await expect(coreToggle).not.toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'true');
    await expect(pluginsToggle).not.toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'true');
    await expect(themesToggle).not.toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'true');

    // Core toggle works
    await expect(coreToggle).not.toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'true');
    await coreToggle.click();
    await page.waitForTimeout(100);
    await expect(coreToggle).toHaveAttribute('aria-checked', 'false');
    await utils.waitForNotification(page, 'Disabled Core auto-updates');
    await expect(allToggle).toHaveAttribute('aria-checked', 'false');

    // Plugins toggle works
    await expect(pluginsToggle).not.toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'true');
    await pluginsToggle.click();
    await page.waitForTimeout(100);
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'false');
    await utils.waitForNotification(page, 'Disabled Plugins auto-update');
    await expect(allToggle).toHaveAttribute('aria-checked', 'false');

    // Themes toggle works
    await expect(themesToggle).not.toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'true');
    await themesToggle.click();
    await page.waitForTimeout(100);
    await expect(themesToggle).toHaveAttribute('aria-checked', 'false');
    await utils.waitForNotification(page, 'Disabled Themes auto-update');
    await expect(allToggle).toHaveAttribute('aria-checked', 'false');

    // All toggle activates all
    await allToggle.click();
    await page.waitForTimeout(100);
    await expect(allToggle).toHaveAttribute('aria-checked', 'true');
    await expect(coreToggle).toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'true');
    await expect(pluginsToggle).toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'true');
    await expect(themesToggle).toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'true');

    // Disabling All toggle returns to previous state
    await allToggle.click();
    await page.waitForTimeout(100);
    await utils.waitForNotification(page, 'Disabled All auto-updates');
    await expect(allToggle).toHaveAttribute('aria-checked', 'false');
    await expect(coreToggle).not.toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'false');
    await expect(pluginsToggle).not.toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'false');
    await expect(themesToggle).not.toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'false');

    // All Toggle takes over again when all are enabled
    await coreToggle.click();
    await pluginsToggle.click();
    await themesToggle.click();
    await page.waitForTimeout(100);
    await expect(allToggle).toHaveAttribute('aria-checked', 'true');
    await expect(coreToggle).toBeDisabled();
    await expect(coreToggle).toHaveAttribute('aria-checked', 'true');
    await expect(pluginsToggle).toBeDisabled();
    await expect(pluginsToggle).toHaveAttribute('aria-checked', 'true');
    await expect(themesToggle).toBeDisabled();
    await expect(themesToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('Content Settings Work', async ({ page }) => {
    // Empty Trash Setting
    const emptyTrashSelect = page.locator('[data-id="empty-trash-select"]');
    await emptyTrashSelect.click();
    await page.waitForTimeout(500);
    
    // Select option 2 (2 weeks)
    await emptyTrashSelect.locator('..').locator('+ .nfd-select__options .nfd-select__option:nth-child(2)').click();
    await page.waitForTimeout(100);
    
    const description = page.locator('#empty-trash-select__description');
    await expect(description).toContainText('The trash will automatically empty every 2 weeks.');

    // Select option 4 (4 weeks)
    await emptyTrashSelect.click();
    await page.waitForTimeout(500);
    await emptyTrashSelect.locator('..').locator('+ .nfd-select__options .nfd-select__option:last-child').click();
    await page.waitForTimeout(100);
    
    await expect(description).toContainText('The trash will automatically empty every 4 weeks.');
  });

  test('Comment Settings Work', async ({ page }) => {
    const commentsSection = page.locator('.wppbh-app-settings-comments');
    await utils.scrollIntoView(commentsSection);
    await expect(commentsSection).toBeVisible();

    // Comments per page setting
    const commentsPerPageSelect = page.locator('[data-id="comments-per-page-select"]');
    await commentsPerPageSelect.click();
    await page.waitForTimeout(500);
    await commentsPerPageSelect.locator('..').locator('+ .nfd-select__options .nfd-select__option:first-child').click();
    await page.waitForTimeout(100);
    
    await expect(commentsSection.locator('label').last()).toContainText('Comments to display per page');

    // Disable comments toggle
    const disableCommentsToggle = page.locator('[data-id="disable-comments-toggle"]');
    await expect(disableCommentsToggle).toHaveAttribute('aria-checked', 'false');
    
    const closeCommentsDaysSelect = page.locator('[data-id="close-comments-days-select"]');
    await expect(closeCommentsDaysSelect).toBeDisabled();
    
    await disableCommentsToggle.click();
    await page.waitForTimeout(100);
    
    await expect(disableCommentsToggle).toHaveAttribute('aria-checked', 'true');
    await expect(closeCommentsDaysSelect).not.toBeDisabled();

    // Close comments after days
    await closeCommentsDaysSelect.click();
    await page.waitForTimeout(100);
    await closeCommentsDaysSelect.locator('..').locator('+ .nfd-select__options .nfd-select__option:last-child').click();
    await page.waitForTimeout(100);
    
    await expect(commentsSection.locator('label').last()).toContainText('Comments to display per page');

    // Change to 14 days
    await closeCommentsDaysSelect.click();
    await page.waitForTimeout(100);
    await closeCommentsDaysSelect.locator('..').locator('+ .nfd-select__options .nfd-select__option:nth-child(6)').click();
    await page.waitForTimeout(100);
    
    await expect(commentsSection.locator('label').nth(1)).toContainText('Close comments after 14 days.');

    // Re-enable comments
    await disableCommentsToggle.click();
    await page.waitForTimeout(100);
    await expect(disableCommentsToggle).toHaveAttribute('aria-checked', 'false');
    await expect(closeCommentsDaysSelect).toBeDisabled();
  });
});
