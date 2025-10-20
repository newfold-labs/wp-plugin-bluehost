const { test, expect } = require('@playwright/test');
const { auth, a11y, utils } = require('../helpers');

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await auth.navigateToAdminPage(page, 'admin.php?page=bluehost#/home');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for the home page to load - check for the main app container and home page class
    await page.waitForSelector('#wppbh-app-rendered', { timeout: 10000 });
    await page.waitForSelector('.wppbh-page-home', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wppbh-app-body');
  });

  test.skip('Home Page Section and Cards all exist', async ({ page }) => {
    // Welcome text
    const welcomeHeading = page.locator('.wppbh-app-body').locator('h1').first();
    await utils.scrollIntoView(welcomeHeading);
    await expect(welcomeHeading).toBeVisible();

    // Solution Card
    const solutionCard = page.locator('[data-cy="solution-card"]');
    await utils.scrollIntoView(solutionCard);
    await expect(solutionCard.locator('h2')).toContainText('Explore');
    
    const solutionHref = await solutionCard.getAttribute('href');
    expect(solutionHref).toContain('solutions');

    // Expert Card
    const expertCard = page.locator('[data-cy="expert-card"]');
    await utils.scrollIntoView(expertCard);
    await expect(expertCard.locator('h3')).toContainText('experts');
    
    const expertHref = await expertCard.getAttribute('href');
    expect(expertHref).toContain('website-design');
    expect(expertHref).toContain('utm_source');
    expect(expertHref).toContain('utm_medium');

    // Help Card
    const helpCard = page.locator('[data-cy="help-card"]');
    await utils.scrollIntoView(helpCard);
    await expect(helpCard.locator('h3')).toContainText('Help');
    
    const helpHref = await helpCard.getAttribute('href');
    expect(helpHref).toContain('help');

    // Pro Design Card
    const proDesignCard = page.locator('[data-cy="pro-design-card"]');
    await utils.scrollIntoView(proDesignCard);
    await expect(proDesignCard.locator('h3')).toContainText('Pro');
    
    const proDesignHref = await proDesignCard.getAttribute('href');
    expect(proDesignHref).toContain('market-place');
    expect(proDesignHref).toContain('utm_source');
    expect(proDesignHref).toContain('utm_medium');

    // Referral Program Card
    const referralCard = page.locator('[data-cy="referral-program-card"]');
    await utils.scrollIntoView(referralCard);
    await expect(referralCard.locator('h3')).toContainText('Refer');
    
    const referralHref = await referralCard.getAttribute('href');
    expect(referralHref).toContain('affiliates');
    expect(referralHref).toContain('utm_source');
    expect(referralHref).toContain('utm_medium');

    // Quick Link Cards
    const quickLinksCard = page.locator('[data-cy="quick-links-card"]');
    await utils.scrollIntoView(quickLinksCard);
    await expect(quickLinksCard.locator('h3')).toContainText('Quick');

    // Hosting Card
    const hostingCard = page.locator('[data-cy="hosting-card"]');
    await utils.scrollIntoView(hostingCard);
    await expect(hostingCard).toContainText('Manage hosting');
    
    const hostingHref = await hostingCard.getAttribute('href');
    expect(hostingHref).toContain('hosting');

    // Blog Card
    const blogCard = page.locator('[data-cy="blog-card"]');
    await utils.scrollIntoView(blogCard);
    await expect(blogCard).toContainText('blog');
    
    const blogHref = await blogCard.getAttribute('href');
    expect(blogHref).toContain('post-new');
    expect(blogHref).toContain('wb-library=patterns');

    // Promotion Card - WonderCart
    const promotionCard = page.locator('[data-cy="promotion-card"]');
    await utils.scrollIntoView(promotionCard);
    await expect(promotionCard).toContainText('sale promotion');
    
    const promotionHref = await promotionCard.getAttribute('href');
    if (promotionHref.includes('wp-admin')) {
      // wondercart
      expect(promotionHref).toContain('admin.php');
    }
    if (promotionHref.includes('bluehost.com')) {
      // ecom family ctb
      expect(promotionHref).toContain('hosting');
    }
  });
});
