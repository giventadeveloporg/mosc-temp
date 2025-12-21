/**
 * Playwright Authentication Helper
 *
 * This module provides functions to authenticate Playwright browser sessions
 * for testing admin pages that require Clerk authentication.
 */

/**
 * Authenticate a Playwright page using Clerk sign-in
 *
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} baseUrl - Base URL of the application
 * @param {Object} credentials - Authentication credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<boolean>} - True if authentication successful
 */
async function authenticatePage(page, baseUrl, credentials) {
  try {
    console.log(`   🔐 Authenticating as ${credentials.email}...`);

    // Navigate to sign-in page
    await page.goto(`${baseUrl}/sign-in`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for sign-in form to be visible
    // Clerk uses various selectors, try common ones
    const emailSelector = 'input[type="email"], input[name="identifier"], input[id*="identifier"], input[placeholder*="email" i]';
    const passwordSelector = 'input[type="password"], input[name="password"]';
    const submitSelector = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Continue")';

    // Wait for email input
    await page.waitForSelector(emailSelector, { timeout: 10000 });
    await page.fill(emailSelector, credentials.email);

    // Wait for password input (might appear after email)
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    await page.fill(passwordSelector, credentials.password);

    // Click submit button
    await page.waitForSelector(submitSelector, { timeout: 10000 });
    await page.click(submitSelector);

    // Wait for navigation after sign-in (redirect to dashboard or home)
    // Clerk typically redirects to / or /dashboard after successful sign-in
    await page.waitForURL(
      (url) => !url.pathname.includes('/sign-in') && !url.pathname.includes('/sign-up'),
      { timeout: 30000 }
    );

    // Verify we're authenticated by checking for user-related elements
    // Or check if we're redirected away from sign-in page
    const currentUrl = page.url();
    const isAuthenticated = !currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up');

    if (isAuthenticated) {
      console.log(`   ✅ Authentication successful! Redirected to: ${currentUrl}`);
      return true;
    } else {
      console.log(`   ❌ Authentication failed - still on sign-in page`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Authentication error: ${error.message}`);
    return false;
  }
}

/**
 * Create an authenticated browser context
 *
 * @param {import('playwright').Browser} browser - Playwright browser instance
 * @param {string} baseUrl - Base URL of the application
 * @param {Object} credentials - Authentication credentials
 * @returns {Promise<{context: import('playwright').BrowserContext, page: import('playwright').Page}>}
 */
async function createAuthenticatedContext(browser, baseUrl, credentials) {
  // Create a new context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  const page = await context.newPage();

  // Authenticate the page
  const authenticated = await authenticatePage(page, baseUrl, credentials);

  if (!authenticated) {
    await context.close();
    throw new Error('Failed to authenticate browser context');
  }

  return { context, page };
}

/**
 * Save authentication state for reuse
 *
 * @param {import('playwright').BrowserContext} context - Authenticated browser context
 * @param {string} statePath - Path to save state file
 * @returns {Promise<void>}
 */
async function saveAuthState(context, statePath) {
  await context.storageState({ path: statePath });
}

/**
 * Load authentication state to create authenticated context
 *
 * @param {import('playwright').Browser} browser - Playwright browser instance
 * @param {string} statePath - Path to saved state file
 * @returns {Promise<{context: import('playwright').BrowserContext, page: import('playwright').Page}>}
 */
async function loadAuthState(browser, statePath) {
  const fs = await import('fs');
  const path = await import('path');

  // Check if state file exists
  if (!fs.existsSync(statePath)) {
    throw new Error(`Auth state file not found: ${statePath}`);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    storageState: statePath
  });

  const page = await context.newPage();
  return { context, page };
}

module.exports = {
  authenticatePage,
  createAuthenticatedContext,
  saveAuthState,
  loadAuthState
};

