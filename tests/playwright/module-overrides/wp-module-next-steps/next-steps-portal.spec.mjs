import { test, expect } from '@playwright/test';
import {
    auth,
    setTestNextStepsData,
    resetNextStepsData
} from '../helpers';

const pluginId = process.env.PLUGIN_ID || 'bluehost';

test.describe('Next Steps Portal in Plugin App', () => {

    test.beforeEach(async ({ page }) => {
        await auth.loginToWordPress(page);
        // Set test Next Steps data
        await setTestNextStepsData();
        // Visit the Next Steps portal
        await page.goto(`/wp-admin/admin.php?page=${pluginId}#/home`);
        // Reload the page to ensure the test data is loaded
        await page.reload();

        // Portal App Renders
        await page.locator('#next-steps-portal').waitFor({ state: 'visible', timeout: 25000 });
        await page.locator('.next-steps-fill #nfd-nextsteps').waitFor({ state: 'visible', timeout: 25000 });
    });

    test.afterEach(async () => {
        // Reset test data
        await resetNextStepsData();
    });

    test('portal renders and displays correctly', async ({ page }) => {
        // Check Basic Structure
        await expect(page.locator('.nfd-track')).toHaveCount(2);
        await expect(page.locator('.nfd-section')).toHaveCount(4);
        await expect(page.locator('.nfd-nextsteps-task-container')).toHaveCount(9);

        // Check that the app has loaded with content
        await expect(page.locator('#nfd-nextsteps p').first()).toBeVisible();
        await expect(page.locator('#nfd-nextsteps p').first()).toContainText('This is a test plan');

        // Marking a task complete updates task and progress bars
        // Progress bar in first section
        await expect(page.locator('[data-nfd-section-id="section1"] .nfd-progress-bar')).toBeVisible();

        // Validate initial progress values
        await expect(page.locator('[data-nfd-section-id="section1"] .nfd-progress-bar-label')).toHaveText('0/1');
        await expect(page.locator('[data-nfd-section-id="section1"] .nfd-progress-bar-inner')).toHaveAttribute('data-percent', '0');

        // Task should be in new state
        await expect(page.locator('[data-nfd-section-id="section1"] #task-s1task1')).toHaveAttribute('data-nfd-task-status', 'new');
        await expect(page.locator('[data-nfd-section-id="section1"]')).toHaveAttribute('open');

        // Complete task
        await page.locator('#task-s1task1 .nfd-nextsteps-task-new .nfd-nextsteps-button-todo')
            .scrollIntoViewIfNeeded();
        await page.locator('#task-s1task1 .nfd-nextsteps-task-new .nfd-nextsteps-button-todo')
            .click();

        // Wait for task to update and celebration to load
        await page.waitForTimeout(500);

        // Task should now be in done state
        await expect(page.locator('[data-nfd-task-id="s1task1"]')).toHaveAttribute('data-nfd-task-status', 'done');

        // Progress should update
        await expect(page.locator('.nfd-progress-bar-label').first()).toHaveText('1/1');
        await expect(page.locator('.nfd-progress-bar-inner').first()).toHaveAttribute('data-percent', '100');

        // Celebrate should be visible
        await expect(page.locator('.nfd-section-complete').first()).toBeVisible();
        await expect(page.locator('.nfd-section-celebrate-text').first()).toHaveText('All complete!');
        await expect(page.locator('.nfd-nextsteps-section-close-button').first()).toBeVisible();

        // Close celebration closes section
        await expect(page.locator('[data-nfd-section-id="section1"]')).toHaveAttribute('open');
        await page.locator('.nfd-nextsteps-section-close-button').first().click();

        // Wait for UI to update
        await page.waitForTimeout(250);

        await expect(page.locator('[data-nfd-section-id="section1"] .nfd-section-celebrate')).not.toBeVisible();
        await expect(page.locator('[data-nfd-section-id="section1"] .nfd-nextsteps-task-container')).not.toBeVisible();
        await expect(page.locator('[data-nfd-section-id="section1"]')).not.toHaveAttribute('open');

        // Open the section
        await page.locator('[data-nfd-section-id="section1"] .nfd-section-header').click();

        // Wait for UI to update
        await page.waitForTimeout(250);

        await expect(page.locator('[data-nfd-section-id="section1"]')).toHaveAttribute('open');
    });
});
