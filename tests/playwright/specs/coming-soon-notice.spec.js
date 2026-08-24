import { test, expect } from '@playwright/test';
import { auth, newfold } from '../helpers';

/**
 * The admin notice shown on non-app wp-admin screens while Coming Soon is active
 * (defined in bootstrap.php via the `newfold/coming-soon/filter/args` filter).
 *
 * Both links in the notice — "coming soon page" and "launch your site" — should
 * take the user to the Coming Soon toggle in the plugin settings, which is the
 * control for turning the coming soon page on and off. Previously the "coming
 * soon page" link pointed at the front-end preview (`?preview=coming_soon`),
 * which rendered the live homepage rather than the toggle. See PRESS0-5044.
 */
test.describe('Coming Soon admin notice', () => {

  test.beforeEach(async () => {
    await newfold.setComingSoon(true);
  });

  test.afterEach(async () => {
    await newfold.setComingSoon(false);
  });

  test('Both notice links point to the coming soon settings toggle', async ({ page }) => {
    // A non-app admin screen, where the notice is rendered.
    await auth.navigateToAdminPage(page, 'options-general.php');

    const notice = page.locator('.notice-warning', {
      hasText: 'Your site is currently displaying a coming soon page',
    });
    await expect(notice).toBeVisible();

    const comingSoonLink = notice.getByRole('link', { name: 'coming soon page' });
    const launchLink = notice.getByRole('link', { name: 'launch your site' });

    // Both links resolve to the coming soon settings section, including the
    // SPA route fragment that selects the toggle.
    for (const link of [comingSoonLink, launchLink]) {
      const href = await link.getAttribute('href');
      expect(href).toContain('page=bluehost');
      expect(href).toContain('nfd-target=coming-soon-section');
      expect(href).toContain('#/settings');
    }

    // The "coming soon page" link must no longer open the front-end preview.
    const comingSoonHref = await comingSoonLink.getAttribute('href');
    expect(comingSoonHref).not.toContain('preview=coming_soon');
  });
});
