import { test, expect } from '@playwright/test';
import {
    auth,
    setTestNextStepsData,
    resetNextStepsData
} from '../helpers';

test.describe('Next Steps Widget', () => {

    test.beforeEach(async ({ page }) => {
        await auth.loginToWordPress(page);
        // Set test Next Steps data
        await setTestNextStepsData();
        // Visit the Next Steps widget
        await page.goto('/wp-admin/index.php');
        // Reload the page to ensure the test data is loaded
        await page.reload();

        // Wait for widget to be visible
        await page.locator('#nfd_next_steps_widget').waitFor({ state: 'visible', timeout: 25000 });
        await page.locator('#nfd_next_steps_widget #nfd-nextsteps').waitFor({ state: 'visible', timeout: 25000 });
        // scroll to the widget
        await page.evaluate(() => {
            const widget = document.querySelector('#nfd_next_steps_widget');
            if (widget) {
                widget.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    test.afterEach(async () => {
        // Reset test data
        await resetNextStepsData();
    });

    test('renders the widget structure correctly', async ({ page }) => {
        // Widget container
        await expect(page.locator('#nfd_next_steps_widget')).toBeVisible();
        await expect(page.locator('#nfd_next_steps_widget .postbox-header h2')).toContainText('Next Steps');

        // Main app structure
        await expect(page.locator('#nfd-nextsteps')).toBeVisible();
        await expect(page.locator('#nfd-nextsteps')).toHaveAttribute('data-nfd-plan-id');

        // Should have tracks
        await expect(page.locator('.nfd-track')).toHaveCount(2);

        // First track should be open by default
        await expect(page.locator('.nfd-track').first()).toHaveAttribute('open');

        // Track has a section
        const firstTrack = page.locator('.nfd-track').first();
        await expect(firstTrack.locator('.nfd-section')).toHaveCount(3);

        // Check section structure
        const firstSection = firstTrack.locator('.nfd-section').first();
        await expect(firstSection.locator('.nfd-section-header')).toBeVisible();
        await expect(firstSection.locator('.nfd-section-title')).toBeVisible();

        await expect(firstSection.locator('.nfd-nextsteps-task-container')).toHaveCount(1);
        await expect(firstSection.locator('.nfd-nextsteps-task-container').first()).toHaveAttribute('id', 'task-s1task1');

        // Task should have proper data attributes
        const taskLink = firstSection.locator('.nfd-nextsteps-task-container#task-s1task1 a').first();
        await expect(taskLink).toHaveAttribute('data-test-id', 'test-task-1');
        await expect(taskLink).toHaveAttribute('data-nfd-prevent-default', 'true');

        // Section 2 should have new dismissed and completed task.
        const secondSection = page.locator('.nfd-section[data-nfd-section-id="section2"]');
        await expect(secondSection.locator('.nfd-progress-bar')).toBeVisible();
        await expect(secondSection.locator('.nfd-progress-bar-label')).toHaveText('1/2');
        await expect(secondSection.locator('.nfd-progress-bar-inner')).toHaveAttribute('data-percent', '50');

        // Section 2 should have 2 tasks
        await expect(secondSection.locator('.nfd-nextsteps-task-container')).toHaveCount(3);

        // A single new task should be visible
        await expect(secondSection.locator('.nfd-nextsteps-task-container').first()).toHaveAttribute('data-nfd-task-status', 'new');
        await expect(secondSection.locator('.nfd-nextsteps-task-new')).toHaveCount(1);
        await expect(secondSection.locator('.nfd-nextsteps-task-new').locator('..')).toHaveAttribute('id', 'task-s2task1');

        const s2t1 = secondSection.locator('.nfd-nextsteps-task-new');
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-todo')).toBeVisible();
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-dismiss')).toBeVisible();
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-link')).toBeVisible();
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-link')).toHaveAttribute('href', /bluehost\.com/);
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-link')).toHaveAttribute('data-nfd-click', 'nextsteps_task_link');
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-link')).toHaveAttribute('data-nfd-event-category', 'nextsteps_task');
        await expect(s2t1.locator('.nfd-nextsteps-button.nfd-nextsteps-button-link')).toHaveAttribute('data-nfd-event-key', 's2task1');

        // Content should be visible
        await expect(s2t1.locator('.nfd-nextsteps-task-content')).toContainText('New Task');

        // Content should contain a link
        const contentLink = s2t1.locator('.nfd-nextsteps-task-content a');
        await expect(contentLink).toBeVisible();
        await expect(contentLink).toHaveAttribute('href', /bluehost\.com/);
        await expect(contentLink).toHaveAttribute('target', '_blank');

        // A single dismissed task should be visible
        await expect(secondSection.locator('.nfd-nextsteps-task-container').nth(1)).toHaveAttribute('data-nfd-task-status', 'dismissed');
        const s2t2 = secondSection.locator('.nfd-nextsteps-task-dismissed');
        await expect(secondSection.locator('.nfd-nextsteps-task-dismissed')).toHaveCount(1);
        await expect(secondSection.locator('.nfd-nextsteps-task-dismissed').locator('..')).toHaveAttribute('id', 'task-s2task2');
        await expect(s2t2.locator('.nfd-nextsteps-button.nfd-nextsteps-button-redo')).toBeVisible();
        await expect(s2t2.locator('.nfd-nextsteps-button.nfd-nextsteps-button-dismiss')).toBeVisible();

        // A single done task should be visible
        await expect(secondSection.locator('.nfd-nextsteps-task-container').last()).toHaveAttribute('data-nfd-task-status', 'done');
        await expect(secondSection.locator('.nfd-nextsteps-task-done')).toHaveCount(1);
        await expect(secondSection.locator('.nfd-nextsteps-task-done').locator('..')).toHaveAttribute('id', 'task-s2task3');
        await expect(secondSection.locator('.nfd-nextsteps-task-done').locator('.nfd-nextsteps-button.nfd-nextsteps-button-redo')).toBeVisible();

        // Section 3 should have 2 complete tasks
        const thirdSection = page.locator('.nfd-section[data-nfd-section-id="section3"]');
        // Section 3 should have progress bar with 2/2
        await expect(thirdSection.locator('.nfd-progress-bar')).toBeVisible();
        await expect(thirdSection.locator('span.nfd-progress-bar-label')).toHaveText('2/2');
        await expect(thirdSection.locator('.nfd-progress-bar-inner')).toHaveAttribute('data-percent', '100');

        // Section 3 should have 2 complete tasks
        await expect(thirdSection.locator('.nfd-nextsteps-task-container')).toHaveCount(2);
        await expect(thirdSection.locator('.nfd-nextsteps-task-container').first()).toHaveAttribute('data-nfd-task-status', 'done');
        await expect(thirdSection.locator('.nfd-nextsteps-task-container').last()).toHaveAttribute('data-nfd-task-status', 'done');

        // Track 2 should have 1 section with 3 new tasks
        const fourthSection = page.locator('.nfd-section[data-nfd-section-id="section4"]');
        // Track 2 should have progress bar with 0/3
        await expect(fourthSection.locator('.nfd-progress-bar')).toBeVisible();
        await expect(fourthSection.locator('span.nfd-progress-bar-label')).toHaveText('0/3');
        await expect(fourthSection.locator('.nfd-progress-bar-inner')).toHaveAttribute('data-percent', '0');

        // Section 4 should have 3 new tasks
        await expect(fourthSection.locator('.nfd-nextsteps-task-container')).toHaveCount(3);
        await expect(fourthSection.locator('.nfd-nextsteps-task-container').first()).toHaveAttribute('data-nfd-task-status', 'new');
        await expect(fourthSection.locator('.nfd-nextsteps-task-container').last()).toHaveAttribute('data-nfd-task-status', 'new');
    });

    test('marking a task complete updates task and progress bars', async ({ page }) => {
        // Find progress bar in first section
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-progress-bar')).toBeVisible();

        // Validate initial progress values
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-progress-bar-label')).toHaveText('0/1');
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-progress-bar-inner')).toHaveAttribute('data-percent', '0');

        // Task should be in new state
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] #task-s1task1')).toHaveAttribute('data-nfd-task-status', 'new');

        // Complete task
        await page.locator('.nfd-section[data-nfd-section-id="section1"] #task-s1task1.nfd-nextsteps-task-container .nfd-nextsteps-task-new .nfd-nextsteps-button-todo').click();

        // wait for task to update
        await page.waitForTimeout(500);

        // Task should now be in done state
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] #task-s1task1')).toHaveAttribute('data-nfd-task-status', 'done');

        // Progress should update
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-progress-bar-label')).toHaveText('1/1');
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-progress-bar-inner')).toHaveAttribute('data-percent', '100');

        // Celebrate should be visible
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-section-celebrate')).toBeVisible();
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-section-celebrate-text')).toHaveText('All complete!');
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-nextsteps-section-close-button')).toBeVisible();

        // Close celebration closes section
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"]')).toHaveAttribute('open');
        await page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-section-complete').click();

        await page.waitForTimeout(250);

        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-section-complete')).not.toBeVisible();
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-nextsteps-task-container')).not.toBeVisible();
        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"]')).not.toHaveAttribute('open');

        // Open the section
        await page.locator('.nfd-section[data-nfd-section-id="section1"] .nfd-section-header').click();

        // await waitForSectionEndpoint(page);
        await page.waitForTimeout(250);

        await expect(page.locator('.nfd-section[data-nfd-section-id="section1"]')).toHaveAttribute('open');
    });

    test('dismisses a task and verifies state change', async ({ page }) => {
        // Find and dismiss a task
        const firstNewTask = page.locator('.nfd-nextsteps-task-container[data-nfd-task-status="new"]').first();
        await expect(firstNewTask).toHaveAttribute('id', 'task-s1task1');
        await expect(firstNewTask.locator('.nfd-nextsteps-button-dismiss')).toBeVisible();

        await page.waitForTimeout(250);
        // Click dismiss button - trigger hover first due to dismiss button requiring hover state
        await firstNewTask.locator('.nfd-nextsteps-button-dismiss').hover();
        await firstNewTask.locator('.nfd-nextsteps-button-dismiss').click();

        // Task should now be dismissed
        await expect(page.locator('#task-s1task1')).toHaveAttribute('data-nfd-task-status', 'dismissed', { timeout: 500 });
    });

    test('handles track and section toggle functionality', async ({ page }) => {
        // First track should be open by default
        await expect(page.locator('.nfd-track').first()).toHaveAttribute('open');

        // Close the track
        await page.locator('.nfd-track').first().locator('.nfd-track-header').click();

        await page.waitForTimeout(250);

        // Should be closed
        await expect(page.locator('.nfd-track').first()).not.toHaveAttribute('open');

        // Open the track again
        await page.locator('.nfd-track').first().locator('.nfd-track-header').click();

        await page.waitForTimeout(250);

        // Should be open
        await expect(page.locator('.nfd-track').first()).toHaveAttribute('open');

        // Get first section and test toggle
        const firstSection = page.locator('.nfd-section').first();
        const wasOpen = (await firstSection.getAttribute('open')) !== null;

        // Click section header to toggle
        await firstSection.locator('.nfd-section-header').click();

        // Wait for UI to update
        await page.waitForTimeout(500);

        // State should change
        if (wasOpen) {
            await expect(firstSection).not.toHaveAttribute('open');
        } else {
            await expect(firstSection).toHaveAttribute('open');
        }
    });
});
