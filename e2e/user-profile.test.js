const { test, expect } = require('@playwright/test');

test.describe('User Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Log In")');
    
    // Wait for login to complete and redirect to home
    await page.waitForURL('http://localhost:3000/');
    
    // Navigate to profile page
    await page.click('a:has-text("Profile")');
    
    // Check if profile page loaded
    await expect(page).toHaveURL('http://localhost:3000/profile');
  });

  test('should display user profile information', async ({ page }) => {
    // Check if user information is displayed
    await expect(page.locator('.user-name')).toBeVisible();
    await expect(page.locator('.user-email')).toBeVisible();
    await expect(page.locator('.user-avatar')).toBeVisible();
    
    // Check if profile tabs are displayed
    await expect(page.locator('button:has-text("Account Details")')).toBeVisible();
    await expect(page.locator('button:has-text("Redeemed Coupons")')).toBeVisible();
    await expect(page.locator('button:has-text("Saved Coupons")')).toBeVisible();
    await expect(page.locator('button:has-text("Cashback History")')).toBeVisible();
  });

  test('should allow editing profile information', async ({ page }) => {
    // Click on edit profile button
    await page.click('button:has-text("Edit Profile")');
    
    // Check if edit form is displayed
    await expect(page.locator('.edit-profile-form')).toBeVisible();
    
    // Update profile information
    await page.fill('input[name="firstName"]', 'Updated');
    await page.fill('input[name="lastName"]', 'User');
    
    // Submit the form
    await page.click('button:has-text("Save Changes")');
    
    // Check if success message is displayed
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Profile updated successfully');
    
    // Check if updated information is displayed
    await expect(page.locator('.user-name')).toContainText('Updated User');
  });

  test('should allow changing password', async ({ page }) => {
    // Navigate to security tab
    await page.click('button:has-text("Security")');
    
    // Click on change password button
    await page.click('button:has-text("Change Password")');
    
    // Check if change password form is displayed
    await expect(page.locator('.change-password-form')).toBeVisible();
    
    // Fill in the form
    await page.fill('input[name="currentPassword"]', 'password123');
    await page.fill('input[name="newPassword"]', 'newPassword123');
    await page.fill('input[name="confirmPassword"]', 'newPassword123');
    
    // Submit the form
    await page.click('button:has-text("Update Password")');
    
    // Check if success message is displayed
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Password updated successfully');
  });

  test('should display redeemed coupons', async ({ page }) => {
    // Navigate to redeemed coupons tab
    await page.click('button:has-text("Redeemed Coupons")');
    
    // Check if redeemed coupons section is displayed
    await expect(page.locator('.redeemed-coupons')).toBeVisible();
    
    // If there are redeemed coupons, check their details
    const redeemedCouponsCount = await page.locator('.redeemed-coupons .coupon-card').count();
    
    if (redeemedCouponsCount > 0) {
      await expect(page.locator('.redeemed-coupons .coupon-title')).toBeVisible();
      await expect(page.locator('.redeemed-coupons .redemption-date')).toBeVisible();
      await expect(page.locator('.redeemed-coupons .coupon-code')).toBeVisible();
    } else {
      // If no redeemed coupons, check for empty state message
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state')).toContainText('No redeemed coupons yet');
    }
  });

  test('should display saved coupons', async ({ page }) => {
    // Navigate to saved coupons tab
    await page.click('button:has-text("Saved Coupons")');
    
    // Check if saved coupons section is displayed
    await expect(page.locator('.saved-coupons')).toBeVisible();
    
    // If there are saved coupons, check their details
    const savedCouponsCount = await page.locator('.saved-coupons .coupon-card').count();
    
    if (savedCouponsCount > 0) {
      await expect(page.locator('.saved-coupons .coupon-title')).toBeVisible();
      await expect(page.locator('.saved-coupons .store-name')).toBeVisible();
      
      // Check if unsave button is available
      await expect(page.locator('.saved-coupons .unsave-button')).toBeVisible();
      
      // Test unsaving a coupon
      await page.click('.saved-coupons .unsave-button:first-child');
      
      // Check if confirmation dialog appears
      await expect(page.locator('.confirmation-dialog')).toBeVisible();
      
      // Confirm unsaving
      await page.click('button:has-text("Confirm")');
      
      // Check if success message is displayed
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Coupon removed from saved list');
      
      // Check if coupon count decreased
      const newSavedCouponsCount = await page.locator('.saved-coupons .coupon-card').count();
      expect(newSavedCouponsCount).toBe(savedCouponsCount - 1);
    } else {
      // If no saved coupons, check for empty state message
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state')).toContainText('No saved coupons yet');
    }
  });

  test('should display cashback history', async ({ page }) => {
    // Navigate to cashback history tab
    await page.click('button:has-text("Cashback History")');
    
    // Check if cashback history section is displayed
    await expect(page.locator('.cashback-history')).toBeVisible();
    
    // Check if cashback summary is displayed
    await expect(page.locator('.cashback-summary')).toBeVisible();
    await expect(page.locator('.total-earned')).toBeVisible();
    await expect(page.locator('.pending-amount')).toBeVisible();
    await expect(page.locator('.available-amount')).toBeVisible();
    
    // If there are cashback transactions, check their details
    const transactionsCount = await page.locator('.cashback-transaction').count();
    
    if (transactionsCount > 0) {
      await expect(page.locator('.cashback-transaction .store-name')).toBeVisible();
      await expect(page.locator('.cashback-transaction .transaction-date')).toBeVisible();
      await expect(page.locator('.cashback-transaction .amount')).toBeVisible();
      await expect(page.locator('.cashback-transaction .status')).toBeVisible();
    } else {
      // If no transactions, check for empty state message
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state')).toContainText('No cashback transactions yet');
    }
  });

  test('should allow requesting cashback withdrawal', async ({ page }) => {
    // Navigate to cashback history tab
    await page.click('button:has-text("Cashback History")');
    
    // Check if withdrawal button is available
    const withdrawButton = page.locator('button:has-text("Withdraw Cashback")');
    
    if (await withdrawButton.isEnabled()) {
      // Click withdraw button
      await withdrawButton.click();
      
      // Check if withdrawal form is displayed
      await expect(page.locator('.withdrawal-form')).toBeVisible();
      
      // Fill in withdrawal details
      await page.selectOption('select[name="paymentMethod"]', 'paypal');
      await page.fill('input[name="paymentEmail"]', 'payment@example.com');
      
      // Submit the form
      await page.click('button:has-text("Request Withdrawal")');
      
      // Check if success message is displayed
      await expect(page.locator('.success-message')).toBeVisible();
      await expect(page.locator('.success-message')).toContainText('Withdrawal request submitted successfully');
      
      // Check if new pending withdrawal appears in the list
      await expect(page.locator('.pending-withdrawal')).toBeVisible();
    } else {
      // If withdraw button is disabled, check for insufficient funds message
      await expect(page.locator('.insufficient-funds')).toBeVisible();
    }
  });

  test('should allow deleting account', async ({ page }) => {
    // Navigate to account settings tab
    await page.click('button:has-text("Account Settings")');
    
    // Click on delete account button
    await page.click('button:has-text("Delete Account")');
    
    // Check if confirmation dialog appears
    await expect(page.locator('.delete-account-dialog')).toBeVisible();
    
    // Enter password for confirmation
    await page.fill('input[name="password"]', 'password123');
    
    // Confirm account deletion
    await page.click('button:has-text("Permanently Delete")');
    
    // Check if redirected to home page with success message
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Account deleted successfully');
    
    // Check if user is logged out
    await expect(page.locator('a:has-text("Login")')).toBeVisible();
  });
});