import { test, expect } from '@playwright/test';
import {
    auth,
    setTestCardsNextStepsData,
    resetNextStepsData,
    setupNextStepsInteractionMocks,
} from '../helpers';

const pluginId = process.env.PLUGIN_ID || 'bluehost';

test.describe('Next Steps Portal in Plugin App with Cards', () => {

    test.beforeEach(async ({ page }) => {
        // Seed DB before any admin HTTP request so PHP-FPM never caches a pre-fixture plan for this worker.
        await setupNextStepsInteractionMocks(page);
        const seeded = await setTestCardsNextStepsData();
        test.skip(!seeded, 'Next Steps cards fixture could not be verified after retries; skipping flaky environment.');
        await auth.loginToWordPress(page);
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
        // Wait for initial load
        await page.waitForTimeout(250);

        // Three non-expired section cards (fixture also includes section-expired, filtered in UI).
        // Longer timeout: cards depend on `window.NewfoldNextSteps` after full plan resolution on the server.
        await expect(page.locator('.nfd-nextsteps-section-card')).toHaveCount(3, { timeout: 20000 });
        // Check that expired section is not rendered
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section-expired"]')).not.toBeVisible();

        // Check that section 1 is rendered with correct title, description, cta, icon, modal title, modal description
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"]')).toBeVisible();
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-section-card-title')).toHaveText('Test Section 1');
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-section-card-description')).toHaveText('Section 1 with 1 task.');
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-buttons .nfd-button')).toHaveText('CTA 1 Text');

        // first incomplete section has primary button
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-buttons .nfd-button')).toHaveClass(/nfd-button--primary/);

        // section with single task loads task href on section button
        const section1Button = page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-buttons .nfd-button');
        const href = await section1Button.getAttribute('href');
        expect(href).toContain('www.bluehost.com');

        // check that svg images are properly loaded and visible
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-section-card-icon-wrapper svg')).toBeVisible();
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-section-card__wireframe svg')).toBeVisible();

        // check section 1 updates when skipped
        await expect(page.locator('.nfd-nextstep-section-card__dismissed-badge')).not.toBeVisible();
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-button--skip')).toBeVisible();

        // CLICK skip section 1 button
        await page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-button--skip').click();

        // Wait for section card to update (intercepts handle API calls)
        await page.waitForTimeout(500);

        await expect(page.locator('.nfd-nextstep-section-card__dismissed-badge')).toBeVisible();
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"]')).toHaveAttribute('data-nfd-section-status', 'dismissed');
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-button--undo')).toBeVisible();

        // CLICK undo section 1 button
        await page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-button--undo').click();

        // Wait for section card to update (intercepts handle API calls)
        await page.waitForTimeout(500);

        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextstep-section-card__dismissed-badge')).not.toBeVisible();
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"]')).toHaveAttribute('data-nfd-section-status', 'new');
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="customize_your_store"] .nfd-nextsteps-button--skip')).toBeVisible();

        // check section 2 renders and task modal opens with proper tasks
        await expect(page.locator('#section-card-section2 .nfd-nextsteps-buttons .nfd-button')).not.toHaveAttribute('href');
        await page.locator('#section-card-section2 .nfd-nextsteps-buttons .nfd-button').click();

        await page.waitForTimeout(250); // wait for modal to load
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();
        await expect(page.locator('.nfd-modal__layout h1.nfd-title')).toHaveText('Section 2 Modal Title');
        await expect(page.locator('.nfd-modal__layout p')).toHaveText('Section 2 modal description.');
        await expect(page.locator('.nfd-nextstep-tasks-modal__tasks')).toBeVisible();

        //task 1
        const s2task1 = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task1"]');
        await expect(s2task1).toBeVisible();
        await expect(s2task1).toHaveAttribute('data-nfd-task-status', 'new');
        await expect(s2task1.locator('.nfd-title')).toContainText('New Task');

        //task 2
        const s2task2 = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task2"]');
        await expect(s2task2).toBeVisible();
        await expect(s2task2).toHaveAttribute('data-nfd-task-status', 'dismissed');
        await expect(s2task2.locator('.nfd-title')).toContainText('Dismissed Task');

        //task 3
        const s2task3 = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task3"]');
        await expect(s2task3).toBeVisible();
        await expect(s2task3).toHaveAttribute('data-nfd-task-status', 'done');
        await expect(s2task3.locator('.nfd-title')).toContainText('Completed Task');

        // check section 2 modal tasks marked as done updates section card as done
        await expect(s2task1.locator('.nfd-nextsteps-button-todo')).toBeVisible();
        await s2task1.locator('.nfd-nextsteps-button-todo').click();

        // manually check task 4, 5, 6 to complete the section
        await page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task4"] .nfd-nextsteps-button-todo').click();
        await page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task5"] .nfd-nextsteps-button-todo').click();
        await page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task6"] .nfd-nextsteps-button-todo').click();

        // Wait for task and section to update (intercepts handle API calls)
        await page.waitForTimeout(500);

        await expect(page.locator('.nfd-modal__layout')).not.toBeVisible();
        await expect(page.locator('.nfd-nextstep-tasks-modal__tasks')).not.toBeVisible();

        // check section 2 card is updated to done
        await expect(page.locator('#section-card-section2')).toBeVisible();
        await expect(page.locator('#section-card-section2 .nfd-nextstep-section-card__completed-badge')).toBeVisible();
        await expect(page.locator('#section-card-section2')).toHaveAttribute('data-nfd-section-status', 'done');

        // section 3
        await expect(page.locator('#section-card-section3')).toBeVisible();
        // has secondary button
        await expect(page.locator('#section-card-section3 .nfd-nextsteps-buttons .nfd-button')).toHaveClass(/nfd-button--secondary/);

        // Check that completed section 3 is rendered with complete badge
        await expect(page.locator('#section-card-section3')).toHaveAttribute('data-nfd-section-status', 'done');
        await expect(page.locator('#section-card-section3')).toHaveAttribute('data-nfd-date-completed');
        await expect(page.locator('#section-card-section3')).toHaveAttribute('data-nfd-now-date');
        await expect(page.locator('#section-card-section3')).toHaveAttribute('data-nfd-expiry-date');
        await expect(page.locator('#section-card-section3')).toHaveAttribute('data-nfd-expires-in', 'a day from now');
        await expect(page.locator('#section-card-section3 .nfd-nextstep-section-card__completed-badge')).toBeVisible();
    });

    test('task data-nfd-prevent-default attribute', async ({ page }) => {
        // Wait for initial load
        await page.waitForTimeout(250);

        // Test section card with single task that has data-nfd-complete-on-click
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"]')).toBeVisible();

        // Verify the section card button has the data attribute
        await page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"] .nfd-button').click();

        // Verify modal opened
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();

        // Find the task with data-nfd-prevent-default attribute
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task4"]')).toBeVisible();
        const s2task4link = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task4"] .nfd-nextsteps-link').first();
        await expect(s2task4link).toHaveAttribute('data-nfd-prevent-default', 'true');
        await expect(s2task4link).not.toHaveAttribute('data-nfd-complete-on-click');

        await s2task4link.click();

        // test that prevent default worked and no navigation happened
        await expect(page).toHaveURL(/\/wp-admin\/admin\.php\?page=.*#\/home/);
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();
    });

    test('task data-nfd-complete-on-click and data-nfd-prevent-default attributes together', async ({ page }) => {
        // Wait for initial load
        await page.waitForTimeout(250);

        // Test section card with single task that has data-nfd-complete-on-click
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"]')).toBeVisible();

        // Verify the section card button has the data attribute
        await page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"] .nfd-button').click();

        // Verify modal opened
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();

        // Find the task with data-nfd-prevent-default attribute
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task5"]')).toBeVisible();
        const s2task5link = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task5"] .nfd-nextsteps-link').first();
        await expect(s2task5link).toHaveAttribute('data-nfd-complete-on-click', 'true');
        await expect(s2task5link).toHaveAttribute('data-nfd-prevent-default', 'true');

        await s2task5link.click();

        // test that complete-on-click worked and navigation happened
        await expect(page).toHaveURL(/\/wp-admin\/admin\.php\?page=.*#\/home/);
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();

        // check that task status changed to done
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task5"]')).toHaveAttribute('data-nfd-task-status', 'done');
        // check that spinner is visible
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task5"] .next-steps-spinner')).toBeVisible();
    });

    test('task data-nfd-complete-on-click attribute', async ({ page }) => {
        // Set up a slow task endpoint for this specific test
        await page.route('**/newfold-next-steps*/v2/plans*/tasks/**', async (route) => {
            const url = route.request().url();
            const taskIdMatch = url.match(/\/tasks\/([^\/\?]+)/);
            const taskId = taskIdMatch ? taskIdMatch[1] : 's1task1';

            const requestBody = route.request().postDataJSON();
            const taskStatus = requestBody?.status || 'done';

            const response = {
                id: taskId,
                status: taskStatus
            };

            // Add delay to simulate slow response
            await new Promise(resolve => setTimeout(resolve, 1500));

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(response)
            });
        });

        // Wait for initial load
        await page.waitForTimeout(250);

        // Test section card with single task that has data-nfd-complete-on-click
        await expect(page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"]')).toBeVisible();

        // Verify the section card button has the data attribute
        await page.locator('.nfd-nextsteps-section-card[data-nfd-section-id="section2"] .nfd-button').click();

        // Verify modal opened
        await expect(page.locator('.nfd-modal__layout')).toBeVisible();

        // Find the task with data-nfd-prevent-default attribute
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task6"]')).toBeVisible();
        const s2task6link = page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task6"] .nfd-nextsteps-link').first();
        await expect(s2task6link).toHaveAttribute('data-nfd-complete-on-click', 'true');
        await expect(s2task6link).not.toHaveAttribute('data-nfd-prevent-default');

        // set up natigation promise
        const navigationPromise = page.waitForURL(/bluehost\.com/, { timeout: 1000 }).catch(() => 'navigated');

        await s2task6link.click();

        // check that spinner is visible
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task6"] .next-steps-spinner')).toBeVisible();
        // check that task status changed to done
        await expect(page.locator('.nfd-nextsteps-task-container[data-nfd-task-id="s2task6"]')).toHaveAttribute('data-nfd-task-status', 'done');

        // test that complete-on-click worked and navigation happened
        await expect(page).not.toHaveURL(/\/wp-admin\/admin\.php\?page=.*#\/home/);
        await navigationPromise;
    });
});
