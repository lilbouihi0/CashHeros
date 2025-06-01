const { test, expect } = require('@playwright/test');

test.describe('Coupon Redemption Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Log In")');
    
    // Wait for login to complete and redirect to home
    await page.waitForURL('http://localhost:3000/');
  });

  test('should display available coupons on the coupons page', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Check if coupons are displayed
    await expect(page.locator('.coupon-card')).toHaveCount.greaterThan(0);
    
    // Check if coupon details are visible
    await expect(page.locator('.coupon-title')).toBeVisible();
    await expect(page.locator('.store-name')).toBeVisible();
    await expect(page.locator('.discount-value')).toBeVisible();
  });

  test('should allow filtering coupons by category', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Get initial coupon count
    const initialCount = await page.locator('.coupon-card').count();
    
    // Click on a category filter
    await page.click('button:has-text("Electronics")');
    
    // Wait for filtered results
    await page.waitForResponse(response => 
      response.url().includes('/api/coupons') && 
      response.status() === 200
    );
    
    // Get filtered coupon count
    const filteredCount = await page.locator('.coupon-card').count();
    
    // Verify that filtering changed the results
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Check if the active filter is displayed
    await expect(page.locator('.active-filter')).toContainText('Electronics');
  });

  test('should allow sorting coupons by different criteria', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Open sort dropdown
    await page.click('button:has-text("Sort By")');
    
    // Select "Highest Discount" option
    await page.click('text=Highest Discount');
    
    // Wait for sorted results
    await page.waitForResponse(response => 
      response.url().includes('/api/coupons') && 
      response.status() === 200
    );
    
    // Get all discount values
    const discountElements = await page.locator('.discount-value').all();
    const discountValues = await Promise.all(
      discountElements.map(async element => {
        const text = await element.textContent();
        return parseInt(text.replace(/\D/g, ''), 10);
      })
    );
    
    // Check if discounts are sorted in descending order
    for (let i = 0; i < discountValues.length - 1; i++) {
      expect(discountValues[i]).toBeGreaterThanOrEqual(discountValues[i + 1]);
    }
  });

  test('should display coupon details when clicking on a coupon', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Click on the first coupon
    await page.click('.coupon-card:first-child');
    
    // Check if redirected to coupon details page
    await expect(page).toHaveURL(/\/coupon\/[a-zA-Z0-9]+/);
    
    // Check if coupon details are displayed
    await expect(page.locator('.coupon-details')).toBeVisible();
    await expect(page.locator('.coupon-code')).toBeVisible();
    await expect(page.locator('.coupon-description')).toBeVisible();
    await expect(page.locator('.expiry-date')).toBeVisible();
    
    // Check if redeem button is displayed
    await expect(page.locator('button:has-text("Redeem")')).toBeVisible();
  });

  test('should allow copying coupon code to clipboard', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Click on the first coupon
    await page.click('.coupon-card:first-child');
    
    // Wait for coupon details page to load
    await expect(page.locator('.coupon-details')).toBeVisible();
    
    // Click the copy button
    await page.click('button:has-text("Copy Code")');
    
    // Check if success message is displayed
    await expect(page.locator('.copy-success')).toBeVisible();
    await expect(page.locator('.copy-success')).toContainText('Copied to clipboard');
  });

  test('should allow redeeming a coupon', async ({ page }) => {
    // Navigate to coupons page
    await page.goto('http://localhost:3000/coupons');
    
    // Click on the first coupon
    await page.click('.coupon-card:first-child');
    
    // Wait for coupon details page to load
    await expect(page.locator('.coupon-details')).toBeVisible();
    
    // Click the redeem button
    await page.click('button:has-text("Redeem")');
    
    // Check if confirmation dialog appears
    await expect(page.locator('.redemption-dialog')).toBeVisible();
    
    // Confirm redemption
    await page.click('button:has-text("Confirm")');
    
    // Check if success message is displayed
    await expect(page.locator('.redemption-success')).toBeVisible();
    await expect(page.locator('.redemption-success')).toContainText('Coupon redeemed successfully');
    
    // Check if coupon is marked as redeemed
    await expect(page.locator('.redeemed-badge')).toBeVisible();
    await expect(page.locator('.redeemed-badge')).toContainText('Redeemed');
  });

  test('should show redeemed coupon in user profile', async ({ page }) => {
    // First redeem a coupon
    await page.goto('http://localhost:3000/coupons');
    await page.click('.coupon-card:first-child');
    await page.click('button:has-text("Redeem")');
    await page.click('button:has-text("Confirm")');
    
    // Wait for redemption to complete
    await expect(page.locator('.redemption-success')).toBeVisible();
    
    // Navigate to user profile
    await page.click('a:has-text("Profile")');
    
    // Check if profile page loaded
    await expect(page).toHaveURL('http://localhost:3000/profile');
    
    // Navigate to redeemed coupons tab
    await page.click('button:has-text("Redeemed Coupons")');
    
    // Check if the redeemed coupon appears in the profile
    await expect(page.locator('.redeemed-coupons .coupon-card')).toBeVisible();
  });

  test('should handle expired coupons correctly', async ({ page }) => {
    // Navigate to expired coupons section
    await page.goto('http://localhost:3000/coupons?filter=expired');
    
    // Check if expired coupons are displayed
    await expect(page.locator('.expired-coupon')).toBeVisible();
    
    // Click on an expired coupon
    await page.click('.expired-coupon:first-child');
    
    // Check if coupon details page shows expired status
    await expect(page.locator('.expired-badge')).toBeVisible();
    await expect(page.locator('.expired-badge')).toContainText('Expired');
    
    // Check if redeem button is disabled
    await expect(page.locator('button:has-text("Redeem")')).toBeDisabled();
  });
});