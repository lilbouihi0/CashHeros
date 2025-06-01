const { test, expect } = require('@playwright/test');

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('http://localhost:3000/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if the login form is displayed
    await expect(page.locator('h1:has-text("Log In")')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Log In")')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in the login form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click the login button
    await page.click('button:has-text("Log In")');
    
    // Check if error message is displayed
    await expect(page.locator('p.error')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in the login form with valid credentials
    // Note: These should be test credentials that exist in your test environment
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click the login button
    await page.click('button:has-text("Log In")');
    
    // Check if redirected to home page
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Check if user is logged in (e.g., by checking for user-specific elements)
    await expect(page.locator('nav')).toContainText('Profile');
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click the sign up link
    await page.click('a:has-text("Sign Up")');
    
    // Check if redirected to signup page
    await expect(page).toHaveURL('http://localhost:3000/signup');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click the forgot password link
    await page.click('a:has-text("Forgot Password")');
    
    // Check if redirected to forgot password page
    await expect(page).toHaveURL('http://localhost:3000/forgot-password');
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // This test requires the @axe-core/playwright package
    // Run accessibility audit
    const accessibilityScanResults = await page.evaluate(async () => {
      // This assumes axe is loaded in your application or test environment
      return await window.axe.run();
    });
    
    // Check if there are no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Coupon Redemption Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Log In")');
    
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
  });

  test('should display available coupons', async ({ page }) => {
    // Check if coupons are displayed
    await expect(page.locator('.coupon-card')).toHaveCount.greaterThan(0);
  });

  test('should be able to view coupon details', async ({ page }) => {
    // Click on the first coupon
    await page.click('.coupon-card:first-child');
    
    // Check if coupon details are displayed
    await expect(page.locator('.coupon-details')).toBeVisible();
    await expect(page.locator('.coupon-code')).toBeVisible();
  });

  test('should be able to redeem a coupon', async ({ page }) => {
    // Click on the first coupon
    await page.click('.coupon-card:first-child');
    
    // Click the redeem button
    await page.click('button:has-text("Redeem")');
    
    // Check if success message is displayed
    await expect(page.locator('.success-message')).toBeVisible();
    
    // Check if coupon is marked as redeemed
    await expect(page.locator('.redeemed-badge')).toBeVisible();
  });

  test('should show coupon in user profile after redemption', async ({ page }) => {
    // Click on the first coupon and redeem it
    await page.click('.coupon-card:first-child');
    await page.click('button:has-text("Redeem")');
    
    // Navigate to user profile
    await page.click('a:has-text("Profile")');
    
    // Check if the redeemed coupon appears in the profile
    await expect(page.locator('.redeemed-coupons .coupon-card')).toHaveCount.greaterThan(0);
  });
});

test.describe('Responsive Design Tests', () => {
  test('should display properly on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to home page
    await page.goto('http://localhost:3000');
    
    // Check if mobile menu button is visible
    await expect(page.locator('.mobile-menu-button')).toBeVisible();
    
    // Check if content is properly sized for mobile
    const contentWidth = await page.evaluate(() => {
      return document.querySelector('main').getBoundingClientRect().width;
    });
    
    expect(contentWidth).toBeLessThanOrEqual(375);
  });

  test('should display properly on tablets', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigate to home page
    await page.goto('http://localhost:3000');
    
    // Check if tablet layout is applied
    const isTabletLayout = await page.evaluate(() => {
      // This would depend on your specific CSS implementation
      const computedStyle = window.getComputedStyle(document.body);
      return computedStyle.getPropertyValue('--is-tablet-view') === 'true';
    });
    
    expect(isTabletLayout).toBe(true);
  });

  test('should display properly on desktops', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to home page
    await page.goto('http://localhost:3000');
    
    // Check if desktop layout is applied
    const isDesktopLayout = await page.evaluate(() => {
      // This would depend on your specific CSS implementation
      const computedStyle = window.getComputedStyle(document.body);
      return computedStyle.getPropertyValue('--is-desktop-view') === 'true';
    });
    
    expect(isDesktopLayout).toBe(true);
  });
});