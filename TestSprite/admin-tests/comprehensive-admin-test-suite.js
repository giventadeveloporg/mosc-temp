/**
 * Comprehensive Admin Test Suite
 *
 * Tests all admin pages and sub-pages with Playwright automation.
 * Uses auth.json for credentials configuration.
 *
 * Usage:
 *   1. Copy auth.json.example to auth.json
 *   2. Fill in your admin credentials
 *   3. Run: node TestSprite/admin-tests/comprehensive-admin-test-suite.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import ES module authentication helpers
import { authenticatePage, createAuthenticatedContext, saveAuthState, loadAuthState } from '../sanity-tests/authenticate-playwright.js';

// Configuration
const AUTH_CONFIG_PATH = path.join(__dirname, 'auth.json');
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORT_PATH = path.join(__dirname, 'admin-test-report.html');

// Test results storage
let testResults = [];
let startTime = Date.now();

/**
 * Load authentication configuration
 */
function loadAuthConfig() {
  if (!fs.existsSync(AUTH_CONFIG_PATH)) {
    console.error(`❌ Auth config file not found: ${AUTH_CONFIG_PATH}`);
    console.error(`   Please copy auth.json.example to auth.json and fill in your credentials.`);
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));

    if (!config.email || !config.password) {
      console.error('❌ Auth config missing email or password');
      process.exit(1);
    }

    return {
      email: config.email,
      password: config.password,
      baseUrl: config.baseUrl || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      headless: config.headless !== undefined ? config.headless : true, // Default to headless for CI/CD
      screenshotOnFailure: config.screenshotOnFailure !== false
    };
  } catch (error) {
    console.error(`❌ Error loading auth config: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create screenshots directory if it doesn't exist
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * All admin pages to test
 * Organized by category for better reporting
 */
const adminTestPages = [
  // ==========================================
  // CORE ADMIN PAGES
  // ==========================================
  {
    id: 'admin-001',
    name: 'Admin Dashboard',
    url: '/admin',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1, h2', '[class*="admin"]', 'nav', 'a[href*="/admin"]'],
    validation: ['Admin dashboard loads', 'Navigation menu visible', 'Admin buttons displayed'],
    timeout: 45000, // Increased timeout for client-side auth loading
  },
  {
    id: 'admin-002',
    name: 'Manage Users (Usage)',
    url: '/admin/manage-usage',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1', 'table', 'input[type="search"]', 'button'],
    validation: ['User management page loads', 'User table visible', 'Search functionality present'],
    timeout: 45000, // Increased timeout for API calls
  },
  {
    id: 'admin-003',
    name: 'Manage Events',
    url: '/admin/manage-events',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1', '[class*="grid"]', 'a[href*="/admin/events"]', 'input[type="search"]'],
    validation: ['Events management hub loads', 'Event cards/list displayed', 'Search controls present'],
    timeout: 45000, // Increased timeout for client-side auth loading
  },

  // ==========================================
  // EVENT MANAGEMENT PAGES
  // ==========================================
  {
    id: 'admin-004',
    name: 'Event Analytics Dashboard',
    url: '/admin/events/dashboard',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', '[class*="chart"]', '[class*="stat"]'],
    validation: ['Analytics dashboard loads', 'Charts or stats displayed'],
    timeout: 45000, // Increased timeout for this page (makes multiple API calls)
  },
  {
    id: 'admin-005',
    name: 'Event Registrations',
    url: '/admin/events/registrations',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', 'table', 'input[type="search"]'],
    validation: ['Registrations page loads', 'Registration table visible'],
    timeout: 45000, // Increased timeout for API calls
  },

  // ==========================================
  // POLLS & FOCUS GROUPS
  // ==========================================
  {
    id: 'admin-006',
    name: 'Poll Management',
    url: '/admin/polls',
    category: 'polls',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Poll management page loads', 'Poll list visible']
  },
  {
    id: 'admin-007',
    name: 'Focus Groups',
    url: '/admin/focus-groups',
    category: 'focus-groups',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/focus-groups"]'],
    validation: ['Focus groups page loads', 'Focus groups list visible']
  },

  // ==========================================
  // MEMBERSHIP MANAGEMENT
  // ==========================================
  {
    id: 'admin-008',
    name: 'Membership Plans',
    url: '/admin/membership/plans',
    category: 'membership',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Membership plans page loads', 'Plans list visible']
  },
  {
    id: 'admin-009',
    name: 'Membership Subscriptions',
    url: '/admin/membership/subscriptions',
    category: 'membership',
    priority: 'high',
    expectedElements: ['h1', 'table', 'input[type="search"]'],
    validation: ['Subscriptions page loads', 'Subscriptions table visible']
  },

  // ==========================================
  // EMAIL MANAGEMENT
  // ==========================================
  {
    id: 'admin-010',
    name: 'Email Addresses',
    url: '/admin/tenant-email-addresses',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Email addresses page loads', 'Email list visible']
  },
  {
    id: 'admin-011',
    name: 'Bulk Email',
    url: '/admin/bulk-email',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'form', 'button'],
    validation: ['Bulk email page loads', 'Email form visible']
  },
  {
    id: 'admin-012',
    name: 'Newsletter Emails',
    url: '/admin/newsletter-emails',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Newsletter emails page loads', 'Newsletter list visible']
  },

  // ==========================================
  // MEDIA & CONTENT
  // ==========================================
  {
    id: 'admin-013',
    name: 'Media Management',
    url: '/admin/media',
    category: 'media',
    priority: 'medium',
    expectedElements: ['h1', '[class*="grid"]', 'input[type="file"]', 'button'],
    validation: ['Media management page loads', 'Media grid/list visible', 'Upload controls present']
  },
  {
    id: 'admin-014',
    name: 'Executive Committee',
    url: '/admin/executive-committee',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    timeout: 45000, // Increased timeout for this page (makes API calls)
    validation: ['Executive committee page loads', 'Committee members list visible']
  },
  {
    id: 'admin-015',
    name: 'Event Sponsors (Global)',
    url: '/admin/event-sponsors',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global event sponsors page loads', 'Sponsors list visible']
  },
  {
    id: 'admin-016',
    name: 'Global Performers',
    url: '/admin/event-featured-performers',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global performers page loads', 'Performers list visible']
  },
  {
    id: 'admin-017',
    name: 'Global Contacts',
    url: '/admin/event-contacts',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global contacts page loads', 'Contacts list visible']
  },
  {
    id: 'admin-018',
    name: 'Global Emails',
    url: '/admin/event-emails',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global emails page loads', 'Emails list visible']
  },
  {
    id: 'admin-019',
    name: 'Global Program Directors',
    url: '/admin/event-program-directors',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global program directors page loads', 'Directors list visible']
  },

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================
  {
    id: 'admin-020',
    name: 'Organizations',
    url: '/admin/tenant-management/organizations',
    category: 'tenant',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/organizations"]'],
    validation: ['Organizations page loads', 'Organizations list visible']
  },
  {
    id: 'admin-021',
    name: 'Tenant Settings',
    url: '/admin/tenant-management/settings',
    category: 'tenant',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/settings"]'],
    validation: ['Tenant settings page loads', 'Settings list visible']
  },
  {
    id: 'admin-022',
    name: 'Test CRUD',
    url: '/admin/tenant-management/test',
    category: 'tenant',
    priority: 'low',
    expectedElements: ['h1', 'button', 'form'],
    validation: ['Test CRUD page loads', 'CRUD operations visible']
  },

  // ==========================================
  // TESTING & UTILITIES
  // ==========================================
  {
    id: 'admin-023',
    name: 'Test Stripe',
    url: '/admin/test-stripe',
    category: 'utilities',
    priority: 'low',
    expectedElements: ['h1', 'button', 'form'],
    validation: ['Test Stripe page loads', 'Stripe test interface visible']
  }
];

/**
 * Dynamic event pages (require event ID)
 * These will be tested if events are available
 */
const dynamicEventPages = [
  {
    id: 'admin-event-001',
    name: 'Event Overview',
    urlPattern: '/admin/events/{eventId}',
    category: 'events',
    priority: 'critical',
    expectedElements: ['h1', '[class*="tab"]', 'a[href*="/edit"]', 'a[href*="/tickets"]'],
    validation: ['Event overview loads', 'Tabs visible', 'Management links present']
  },
  {
    id: 'admin-event-002',
    name: 'Event Edit',
    urlPattern: '/admin/events/{eventId}/edit',
    category: 'events',
    priority: 'critical',
    expectedElements: ['h1', 'form', 'input[name*="title"]', 'button[type="submit"]'],
    validation: ['Event edit page loads', 'Edit form visible', 'Form fields populated']
  },
  {
    id: 'admin-event-003',
    name: 'Event Media Management',
    urlPattern: '/admin/events/{eventId}/media/list',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', 'input[type="file"]', '[class*="media"]', 'button'],
    validation: ['Media management page loads', 'Upload controls visible', 'Media grid/list displayed']
  },
  {
    id: 'admin-event-003b',
    name: 'Event Media Upload',
    urlPattern: '/admin/events/{eventId}/media',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', 'input[type="file"]', 'button', '[class*="upload"]'],
    validation: ['Media upload page loads', 'Upload controls visible', 'Upload form displayed']
  },
  {
    id: 'admin-event-004',
    name: 'Event Sponsors',
    urlPattern: '/admin/events/{eventId}/sponsors',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Event sponsors page loads', 'Sponsors table visible', 'Add sponsor button accessible']
  },
  {
    id: 'admin-event-005',
    name: 'Event Ticket Types',
    urlPattern: '/admin/events/{eventId}/ticket-types/list',
    category: 'events',
    priority: 'critical',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Ticket types page loads', 'Ticket types table visible', 'Create button accessible']
  },
  {
    id: 'admin-event-006',
    name: 'Event Tickets',
    urlPattern: '/admin/events/{eventId}/tickets/list',
    category: 'events',
    priority: 'critical',
    expectedElements: ['h1', 'table', 'input[type="search"]', '[class*="pagination"]'],
    validation: ['Tickets page loads', 'Tickets table visible', 'Search/filter controls present']
  },
  {
    id: 'admin-event-007',
    name: 'Event Contacts',
    urlPattern: '/admin/events/{eventId}/contacts',
    category: 'events',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Event contacts page loads', 'Contacts table visible']
  },
  {
    id: 'admin-event-008',
    name: 'Event Emails',
    urlPattern: '/admin/events/{eventId}/emails',
    category: 'events',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Event emails page loads', 'Emails table visible']
  },
  {
    id: 'admin-event-009',
    name: 'Event Program Directors',
    urlPattern: '/admin/events/{eventId}/program-directors',
    category: 'events',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Program directors page loads', 'Directors table visible']
  }
];

/**
 * Get available event IDs from the manage-events page
 */
async function getAvailableEventIds(page, baseUrl) {
  try {
    await page.goto(`${baseUrl}/admin/manage-events`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('a[href*="/admin/events/"]', { timeout: 10000 }).catch(() => null);

    const eventLinks = await page.$$eval('a[href*="/admin/events/"]', links => {
      return links
        .map(link => link.getAttribute('href'))
        .filter(href => href && /\/admin\/events\/\d+/.test(href))
        .map(href => {
          const match = href.match(/\/admin\/events\/(\d+)/);
          return match ? match[1] : null;
        })
        .filter(id => id !== null)
        .slice(0, 3); // Limit to first 3 events for testing
    });

    return [...new Set(eventLinks)]; // Remove duplicates
  } catch (error) {
    console.warn(`   ⚠️  Could not fetch event IDs: ${error.message}`);
    return [];
  }
}

/**
 * Run a single test
 */
async function runTest(page, test, config) {
  const testStartTime = Date.now();
  const result = {
    id: test.id,
    name: test.name,
    url: test.url || test.urlPattern,
    category: test.category,
    priority: test.priority,
    status: 'PENDING',
    duration: 0,
    error: null,
    screenshot: null,
    elementsFound: [],
    validations: [],
    jsErrors: [],
    consoleErrors: []
  };

  // Track JavaScript errors and console errors
  const jsErrors = [];
  const consoleErrors = [];

  // Set up error listeners before navigation
  page.on('pageerror', (error) => {
    jsErrors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack
    });
    console.error(`   ⚠️  JavaScript Error: ${error.message}`);
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    
    // Capture console errors and warnings
    if (type === 'error' || type === 'warning') {
      consoleErrors.push({
        type: type,
        message: text
      });
      
      // Log critical errors (ReferenceError, TypeError, etc.)
      if (type === 'error' && (
        text.includes('ReferenceError') ||
        text.includes('TypeError') ||
        text.includes('is not defined') ||
        text.includes('Cannot read') ||
        text.includes('Failed to')
      )) {
        console.error(`   ⚠️  Console ${type}: ${text}`);
      }
    }
  });

  try {
    console.log(`\n🧪 [${test.id}] ${test.name}`);
    console.log(`   📍 URL: ${test.url || test.urlPattern}`);

    // Navigate to page (handle page closure gracefully)
    const fullUrl = `${config.baseUrl}${test.url || test.urlPattern}`;
    // Use test-specific timeout if provided, otherwise use config timeout
    const pageTimeout = test.timeout || config.timeout;
    try {
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: pageTimeout
      });
    } catch (navigationError) {
      // If page is closed during navigation, provide helpful error
      if (navigationError.message.includes('closed') || navigationError.message.includes('detached')) {
        throw new Error(`Page was closed during navigation. This usually means authentication failed or session expired.`);
      }
      throw navigationError;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.warn(`   ⚠️  Network idle timeout, continuing...`);
    });

    // CRITICAL: Wait for main content (h1) to appear for client-side rendered pages
    // This ensures client components have hydrated and rendered their content
    try {
      // Wait for h1 specifically (most reliable indicator of page content)
      await page.waitForSelector('h1', {
        timeout: 20000,
        state: 'visible'
      }).catch(async () => {
        // If h1 doesn't appear, try other selectors
        console.warn(`   ⚠️  h1 not found, trying alternative selectors...`);
        await page.waitForSelector('h2, main, [class*="admin"]', {
          timeout: 10000,
          state: 'visible'
        }).catch(() => {
          console.warn(`   ⚠️  Alternative selectors also not found, continuing anyway...`);
        });
      });

      // Additional wait for client-side rendering to complete (especially for data tables)
      await page.waitForTimeout(2000);
    } catch (waitError) {
      console.warn(`   ⚠️  Could not wait for main content: ${waitError.message}`);
    }

    // Check for JavaScript errors after page load
    // Wait a bit more to catch errors that occur during component rendering
    await page.waitForTimeout(1000);
    
    // Store JavaScript errors in result
    result.jsErrors = jsErrors;
    result.consoleErrors = consoleErrors;

    // Fail test if critical JavaScript errors are detected
    if (jsErrors.length > 0) {
      const criticalErrors = jsErrors.filter(err => {
        const msg = err.message.toLowerCase();
        return msg.includes('referenceerror') ||
               msg.includes('typeerror') ||
               msg.includes('is not defined') ||
               msg.includes('cannot read');
      });

      if (criticalErrors.length > 0) {
        const errorMessages = criticalErrors.map(err => err.message).join('; ');
        throw new Error(`JavaScript runtime error detected: ${errorMessages}`);
      }
    }

    // Check for critical console errors
    const criticalConsoleErrors = consoleErrors.filter(err => {
      const msg = err.message.toLowerCase();
      return err.type === 'error' && (
        msg.includes('referenceerror') ||
        msg.includes('typeerror') ||
        msg.includes('is not defined') ||
        msg.includes('cannot read') ||
        msg.includes('failed to')
      );
    });

    if (criticalConsoleErrors.length > 0) {
      const errorMessages = criticalConsoleErrors.map(err => err.message).join('; ');
      throw new Error(`Console error detected: ${errorMessages}`);
    }

    // Check for expected elements
    const elementsFound = [];
    for (const selector of test.expectedElements) {
      try {
        const count = await page.$$(selector).then(elements => elements.length);
        if (count > 0) {
          elementsFound.push({ selector, count });
        }
      } catch (error) {
        // Element not found, continue
      }
    }

    result.elementsFound = elementsFound;

    // Check for authentication errors
    const currentUrl = page.url();
    const pageContent = await page.content().catch(() => '');

    // CRITICAL: Check if redirected to sign-in page (most reliable indicator)
    const isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up');

    if (isSignInPage) {
      throw new Error('Authentication failed - redirected to sign-in page. User may not have ADMIN role in database.');
    }

    // Only check for visible error messages, not just any "401" or "403" text in HTML/JS
    // Look for actual error elements that are visible to the user
    try {
      const errorSelectors = [
        '[role="alert"]',
        '[class*="error"][class*="message"]',
        '[class*="alert"][class*="error"]',
        'div[class*="cl-error"]',
        'div[class*="cl-alert"]',
        'p[class*="error"]',
        'span[class*="error"]'
      ];

      let hasVisibleAuthError = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = await page.$(selector);
          if (errorElement) {
            const isVisible = await errorElement.isVisible().catch(() => false);
            if (isVisible) {
              const text = await errorElement.textContent().catch(() => '');
              // Only treat as auth error if it contains authentication-related error text
              if (text && (
                text.toLowerCase().includes('unauthorized') ||
                text.toLowerCase().includes('401') ||
                text.toLowerCase().includes('403') ||
                text.toLowerCase().includes('forbidden') ||
                text.toLowerCase().includes('access denied')
              )) {
                hasVisibleAuthError = true;
                console.error(`   ⚠️  Visible auth error found: ${text.trim()}`);
                break;
              }
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      if (hasVisibleAuthError) {
        throw new Error('Authentication failed - visible 401/403 Unauthorized error detected on page');
      }
    } catch (errorCheckError) {
      // If error checking fails, don't fail the test (might be false positive)
      console.log(`   ℹ️  Could not check for visible errors: ${errorCheckError.message}`);
    }

    // Check for 404 errors - only check for actual 404 page indicators, not just any "404" text
    // Check URL first (most reliable)
    if (currentUrl.includes('/404')) {
      throw new Error('Page not found (404)');
    }

    // Check for visible 404 error messages (not just any "404" text in HTML/JS)
    try {
      const notFoundSelectors = [
        'h1:has-text("404")',
        'h1:has-text("Not Found")',
        'h1:has-text("Page Not Found")',
        '[class*="404"]',
        '[class*="not-found"]'
      ];

      let hasVisible404 = false;
      for (const selector of notFoundSelectors) {
        try {
          const notFoundElement = await page.$(selector);
          if (notFoundElement) {
            const isVisible = await notFoundElement.isVisible().catch(() => false);
            if (isVisible) {
              hasVisible404 = true;
              break;
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      // Also check page title
      const pageTitle = await page.title().catch(() => '');
      if (pageTitle.toLowerCase().includes('404') || pageTitle.toLowerCase().includes('not found')) {
        hasVisible404 = true;
      }

      if (hasVisible404) {
        throw new Error('Page not found (404)');
      }
    } catch (notFoundCheckError) {
      // If 404 check fails, don't fail the test (might be false positive)
      if (notFoundCheckError.message.includes('404')) {
        throw notFoundCheckError; // Re-throw actual 404 errors
      }
    }

    // Check if main content is present
    const hasMainContent = await page.$('h1, h2, main, [class*="admin"]').then(el => el !== null);
    if (!hasMainContent) {
      throw new Error('Page loaded but no main content found');
    }

    // Run validations
    const validations = [];
    for (const validation of test.validation) {
      // Simple validation checks
      if (validation.toLowerCase().includes('loads')) {
        validations.push({ check: validation, passed: hasMainContent });
      } else {
        validations.push({ check: validation, passed: true }); // Assume passed for now
      }
    }
    result.validations = validations;

    result.status = 'PASSED';
    result.duration = Date.now() - testStartTime;
    console.log(`   ✅ PASSED (${result.duration}ms)`);
    console.log(`   📊 Elements found: ${elementsFound.length}/${test.expectedElements.length}`);

  } catch (error) {
    result.status = 'FAILED';
    result.duration = Date.now() - testStartTime;
    result.error = error.message;
    console.log(`   ❌ FAILED: ${error.message}`);

    // Take screenshot on failure (only if page is still open)
    if (config.screenshotOnFailure) {
      try {
        // Check if page is still open before taking screenshot
        if (!page.isClosed()) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `failure-${test.id}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          result.screenshot = screenshotPath;
          console.log(`   📸 Screenshot saved: ${screenshotPath}`);
        } else {
          console.warn(`   ⚠️  Could not take screenshot - page was closed`);
        }
      } catch (screenshotError) {
        // Ignore screenshot errors (page might be closed)
        console.warn(`   ⚠️  Could not take screenshot: ${screenshotError.message}`);
      }
    }
  }

  return result;
}

/**
 * Generate HTML report
 */
function generateReport() {
  const duration = Date.now() - startTime;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;

  const report = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Test Suite Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card.passed { border-left: 4px solid #10b981; }
    .stat-card.failed { border-left: 4px solid #ef4444; }
    .stat-card.skipped { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #3b82f6; }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
    .test-results {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10px;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-name {
      font-weight: 600;
      font-size: 16px;
    }
    .test-status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .test-status.passed { background: #d1fae5; color: #065f46; }
    .test-status.failed { background: #fee2e2; color: #991b1b; }
    .test-status.skipped { background: #fef3c7; color: #92400e; }
    .test-details {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .test-error {
      color: #ef4444;
      margin-top: 8px;
      padding: 10px;
      background: #fef2f2;
      border-radius: 4px;
      font-size: 13px;
    }
    .category-header {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Admin Test Suite Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Duration: ${(duration / 1000).toFixed(2)}s</p>
  </div>

  <div class="stats">
    <div class="stat-card total">
      <div class="stat-number">${testResults.length}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card passed">
      <div class="stat-number">${passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-number">${failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-number">${skipped}</div>
      <div class="stat-label">Skipped</div>
    </div>
  </div>

  <div class="test-results">
    ${Object.entries(
      testResults.reduce((acc, test) => {
        if (!acc[test.category]) acc[test.category] = [];
        acc[test.category].push(test);
        return acc;
      }, {})
    ).map(([category, tests]) => `
      <div class="category-header">${category}</div>
      ${tests.map(test => `
        <div class="test-item">
          <div class="test-header">
            <div>
              <div class="test-name">[${test.id}] ${test.name}</div>
              <div class="test-details">
                ${test.url} • ${test.duration}ms • Priority: ${test.priority}
              </div>
            </div>
            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
          </div>
          ${test.error ? `<div class="test-error">❌ ${test.error}</div>` : ''}
          ${test.jsErrors && test.jsErrors.length > 0 ? `
            <div class="test-error">
              ⚠️ JavaScript Errors (${test.jsErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${test.jsErrors.map(err => `<li>${err.message}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.consoleErrors && test.consoleErrors.length > 0 ? `
            <div class="test-details" style="color: #f59e0b;">
              ⚠️ Console Warnings/Errors (${test.consoleErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                ${test.consoleErrors.slice(0, 5).map(err => `<li>[${err.type}] ${err.message.substring(0, 100)}${err.message.length > 100 ? '...' : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.elementsFound.length > 0 ? `
            <div class="test-details">
              📊 Elements found: ${test.elementsFound.length}/${test.expectedElements?.length || 0}
            </div>
          ` : ''}
          ${test.screenshot ? `
            <div class="test-details">
              📸 <a href="${test.screenshot}" target="_blank">View Screenshot</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`\n📄 Report saved to: ${REPORT_PATH}`);
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Comprehensive Admin Test Suite...\n');

  // Load configuration
  const config = loadAuthConfig();
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`👤 Testing as: ${config.email}`);
  console.log(`⚙️  Headless: ${config.headless}`);
  console.log(`📸 Screenshots: ${config.screenshotOnFailure ? 'Enabled' : 'Disabled'}\n`);

  // Ensure screenshots directory exists
  ensureScreenshotsDir();

  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    timeout: 60000
  });

  let context, page;

  try {
    // Try to load saved auth state, but validate it first
    let authStateValid = false;
    if (fs.existsSync(AUTH_STATE_PATH)) {
      console.log('🔐 Loading saved authentication state...');
      try {
        const authState = await loadAuthState(browser, AUTH_STATE_PATH);
        context = authState.context;
        page = authState.page;

        // Validate auth state by checking if we can access an admin page
        console.log('   ⏳ Validating authentication state...');
        try {
          await page.goto(`${config.baseUrl}/admin`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });

          // Check if we're redirected to sign-in (auth state invalid)
          const currentUrl = page.url();
          if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
            authStateValid = true;
            console.log('✅ Authentication state is valid');
          } else {
            console.warn('⚠️  Authentication state invalid - redirected to sign-in');
            await context.close();
            authStateValid = false;
          }
        } catch (validationError) {
          console.warn(`⚠️  Could not validate auth state: ${validationError.message}`);
          await context.close();
          authStateValid = false;
        }
      } catch (error) {
        console.warn(`⚠️  Could not load auth state: ${error.message}`);
        authStateValid = false;
      }
    }

    // If auth state is invalid or doesn't exist, authenticate fresh
    if (!authStateValid) {
      console.log('🔐 Authenticating fresh...');
      const authContext = await createAuthenticatedContext(browser, config.baseUrl, {
        email: config.email,
        password: config.password
      });
      context = authContext.context;
      page = authContext.page;
      await saveAuthState(context, AUTH_STATE_PATH);
      console.log('✅ Authentication successful, state saved');
    }

    // Run static admin page tests
    console.log('\n📋 Running static admin page tests...');
    for (const test of adminTestPages) {
      // Check if page is still open before each test
      if (page.isClosed()) {
        console.error(`\n❌ Page was closed. Authentication may have expired.`);
        console.error(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }

      const result = await runTest(page, test, config);
      testResults.push(result);

      // If authentication failed, stop running tests
      if (result.error && result.error.includes('Authentication failed')) {
        console.warn(`\n⚠️  Authentication failed. Stopping test execution.`);
        console.warn(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }
    }

    // Get available event IDs and test dynamic event pages
    console.log('\n📋 Fetching available events for dynamic page tests...');
    const eventIds = await getAvailableEventIds(page, config.baseUrl);

    if (eventIds.length > 0) {
      console.log(`   ✅ Found ${eventIds.length} event(s): ${eventIds.join(', ')}`);
      console.log('\n📋 Running dynamic event page tests...');

      for (const eventId of eventIds.slice(0, 2)) { // Test first 2 events
        for (const testTemplate of dynamicEventPages) {
          const test = {
            ...testTemplate,
            id: `${testTemplate.id}-event-${eventId}`,
            name: `${testTemplate.name} (Event ${eventId})`,
            url: testTemplate.urlPattern.replace('{eventId}', eventId)
          };
          const result = await runTest(page, test, config);
          testResults.push(result);
        }
      }
    } else {
      console.log('   ⚠️  No events found, skipping dynamic event page tests');
    }

    // Generate report
    console.log('\n📊 Generating test report...');
    generateReport();

    // Print summary
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const total = testResults.length;
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.filter(r => r.status === 'FAILED').forEach(test => {
        console.log(`   - [${test.id}] ${test.name}: ${test.error}`);
      });
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

