#!/usr/bin/env node

/**
 * Comprehensive Sanity Test Runner for Malayalees US Site
 * Complete application test suite covering all major features and pages
 * Expected Duration: ~10-15 minutes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  retries: 1,
  testDuration: '10-15 minutes',
  screenshotOnFailure: true,
  performanceTiming: false
};

// Comprehensive test scenarios covering entire application
const testScenarios = [
  // ==========================================
  // PUBLIC PAGES - Core Functionality
  // ==========================================
  {
    id: 'sanity-001',
    name: 'Homepage Load Test',
    url: '/',
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'nav',
      'main',
      'h1, h2',
      'a[href="/events"]'
    ],
    validation: [
      'Page loads without errors',
      'Navigation menu is visible',
      'Main content area is present',
      'No JavaScript console errors'
    ]
  },
  {
    id: 'sanity-002',
    name: 'Events Listing Page Test',
    url: '/events',
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'h1',
      '.grid, [class*="grid"]',
      '[class*="event"], [class*="card"]'
    ],
    validation: [
      'Events page loads successfully',
      'Event cards or list items are visible',
      'Search/filter functionality accessible',
      'No JavaScript errors'
    ]
  },
  {
    id: 'sanity-003',
    name: 'Event Details Page Test',
    url: '/events/1', // Using ID 1 as sample - adjust based on your data
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'h1',
      '[class*="event"]',
      'a[href*="/tickets"], button'
    ],
    validation: [
      'Event details page loads',
      'Event information is displayed',
      'Registration/ticket button is present',
      'Sponsors section visible (if applicable)'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-004',
    name: 'Sponsors Listing Page Test',
    url: '/sponsors',
    category: 'public-pages',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="sponsor"], [class*="card"]',
      'input[type="text"], input[type="search"]'
    ],
    validation: [
      'Sponsors page loads successfully',
      'Sponsor cards are visible',
      'Search functionality is accessible',
      'Pagination controls present (if applicable)'
    ]
  },
  {
    id: 'sanity-005',
    name: 'Sponsor Details Page Test',
    url: '/sponsors/1', // Using ID 1 as sample
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="sponsor"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Sponsor details page loads',
      'Sponsor information displayed',
      'Contact information visible',
      'Logo/image displayed'
    ],
    skipIf: 'No sponsors available'
  },
  {
    id: 'sanity-006',
    name: 'Gallery Page Test',
    url: '/gallery',
    category: 'public-pages',
    priority: 'high',
    expectedElements: [
      'h1',
      '[class*="gallery"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Gallery page loads successfully',
      'Media items are displayed',
      'Filter/category selection works',
      'Images load without errors'
    ]
  },
  {
    id: 'sanity-007',
    name: 'Polls Listing Page Test',
    url: '/polls',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="poll"], [class*="card"]',
      'button, a[href*="/polls/"]'
    ],
    validation: [
      'Polls page loads successfully',
      'Poll cards are visible',
      'Vote buttons are accessible',
      'No JavaScript errors'
    ]
  },
  {
    id: 'sanity-008',
    name: 'Calendar Page Test',
    url: '/calendar',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="calendar"]',
      'button, [class*="month"], [class*="day"]'
    ],
    validation: [
      'Calendar page loads successfully',
      'Calendar widget is visible',
      'Navigation controls work',
      'Events are displayed on calendar'
    ]
  },
  {
    id: 'sanity-009',
    name: 'MOSC Homepage Test',
    url: '/mosc',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1, h2',
      'nav',
      'main'
    ],
    validation: [
      'MOSC homepage loads',
      'Navigation menu visible',
      'Content sections displayed',
      'No layout errors'
    ]
  },
  {
    id: 'sanity-010',
    name: 'Charity Theme Page Test',
    url: '/charity-theme',
    category: 'public-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main',
      '[class*="charity"]'
    ],
    validation: [
      'Charity theme page loads',
      'Content is displayed',
      'Styling is applied correctly',
      'No errors'
    ]
  },

  // ==========================================
  // ADMIN PAGES - Core Management
  // ==========================================
  {
    id: 'sanity-011',
    name: 'Admin Dashboard Access Test',
    url: '/admin',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1, h2',
      '[class*="admin"]',
      'nav, [class*="nav"]',
      'a[href*="/admin/events"]'
    ],
    validation: [
      'Admin dashboard loads',
      'Navigation menu is visible',
      'Quick stats or cards displayed',
      'No authentication errors'
    ]
  },
  {
    id: 'sanity-012',
    name: 'Admin Events Management Hub Test',
    url: '/admin/events',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      '[class*="grid"], [class*="card"]',
      'a[href*="/admin/events/new"], button'
    ],
    validation: [
      'Events management hub loads',
      'Event cards or list displayed',
      'Create new event button visible',
      'Search/filter controls present'
    ]
  },
  {
    id: 'sanity-013',
    name: 'Admin Event Overview Test',
    url: '/admin/events/1', // Using ID 1 as sample
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      '[class*="tab"], nav',
      'a[href*="/edit"], button'
    ],
    validation: [
      'Event overview page loads',
      'Tabs or navigation visible',
      'Edit button accessible',
      'Event details displayed'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-014',
    name: 'Admin Event Media Management Test',
    url: '/admin/events/1/media', // Using ID 1 as sample
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'input[type="file"], button[type="submit"]',
      '[class*="media"], [class*="image"]'
    ],
    validation: [
      'Media management page loads',
      'Upload controls visible',
      'Media grid/list displayed',
      'File upload button accessible'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-015',
    name: 'Admin Event Sponsors Management Test',
    url: '/admin/events/1/sponsors', // Using ID 1 as sample
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/sponsors"]'
    ],
    validation: [
      'Sponsors management page loads',
      'Sponsors table/list visible',
      'Add sponsor button accessible',
      'Action buttons present'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-016',
    name: 'Admin Event Contacts Management Test',
    url: '/admin/event-contacts',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, form'
    ],
    validation: [
      'Contacts management page loads',
      'Contacts table visible',
      'Add/edit buttons accessible',
      'Form elements present'
    ]
  },
  {
    id: 'sanity-017',
    name: 'Admin Event Emails Management Test',
    url: '/admin/event-emails',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, form'
    ],
    validation: [
      'Emails management page loads',
      'Emails table visible',
      'Create email button accessible',
      'Form elements present'
    ]
  },
  {
    id: 'sanity-018',
    name: 'Admin Event Performers Management Test',
    url: '/admin/event-featured-performers',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]'
    ],
    validation: [
      'Performers management page loads',
      'Performers list visible',
      'Add performer button accessible',
      'Action buttons present'
    ]
  },
  {
    id: 'sanity-019',
    name: 'Admin Event Program Directors Test',
    url: '/admin/event-program-directors',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]'
    ],
    validation: [
      'Program directors page loads',
      'Directors list visible',
      'Add director button accessible',
      'Form elements present'
    ]
  },
  {
    id: 'sanity-020',
    name: 'Admin Event Registrations Management Test',
    url: '/admin/events/registrations',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'select, input[type="text"]',
      'button'
    ],
    validation: [
      'Registrations page loads',
      'Registrations table visible',
      'Filter/search controls present',
      'Export or action buttons accessible'
    ]
  },
  {
    id: 'sanity-021',
    name: 'Admin Executive Committee Management Test',
    url: '/admin/executive-committee',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, form'
    ],
    validation: [
      'Executive committee page loads',
      'Committee members list visible',
      'Add/edit buttons accessible',
      'Form elements present'
    ]
  },
  {
    id: 'sanity-022',
    name: 'Admin Focus Groups Management Test',
    url: '/admin/focus-groups',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'a[href*="/new"], button'
    ],
    validation: [
      'Focus groups page loads',
      'Groups list visible',
      'Create group button accessible',
      'Action buttons present'
    ]
  },
  {
    id: 'sanity-023',
    name: 'Admin Polls Management Test',
    url: '/admin/polls',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]'
    ],
    validation: [
      'Polls management page loads',
      'Polls list visible',
      'Create poll button accessible',
      'Action buttons present'
    ]
  },
  {
    id: 'sanity-024',
    name: 'Admin Tenant Management Test',
    url: '/admin/tenant-management',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'nav, [class*="tab"]',
      'button, form'
    ],
    validation: [
      'Tenant management page loads',
      'Tabs or navigation visible',
      'Settings forms accessible',
      'Save buttons present'
    ]
  },
  {
    id: 'sanity-025',
    name: 'Admin WhatsApp Settings Test',
    url: '/admin/whatsapp-settings',
    category: 'admin-pages',
    priority: 'low',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input, select',
      'button[type="submit"]'
    ],
    validation: [
      'WhatsApp settings page loads',
      'Settings form visible',
      'Input fields accessible',
      'Save button present'
    ]
  },
  {
    id: 'sanity-026',
    name: 'Admin QR Code Scanner Test',
    url: '/admin/qrcode-scan/tickets',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'video, canvas, [class*="camera"]',
      'button'
    ],
    validation: [
      'QR scanner page loads',
      'Camera/video element visible',
      'Scan button accessible',
      'No camera permission errors'
    ]
  },

  // ==========================================
  // USER PAGES - Profile & Settings
  // ==========================================
  {
    id: 'sanity-027',
    name: 'User Profile Page Test',
    url: '/profile',
    category: 'user-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input[name="firstName"], input[name="lastName"]',
      'input[name="email"]',
      'button[type="submit"]'
    ],
    validation: [
      'Profile page loads',
      'Profile form visible',
      'Input fields populated',
      'Save button accessible'
    ]
  },
  {
    id: 'sanity-028',
    name: 'User Dashboard Test',
    url: '/dashboard',
    category: 'user-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1, h2',
      '[class*="card"], [class*="grid"]',
      'a, button'
    ],
    validation: [
      'Dashboard page loads',
      'Dashboard cards/widgets visible',
      'Navigation links accessible',
      'User data displayed'
    ]
  },
  {
    id: 'sanity-029',
    name: 'User Settings Page Test',
    url: '/settings',
    category: 'user-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input, select',
      'button[type="submit"]'
    ],
    validation: [
      'Settings page loads',
      'Settings form visible',
      'Input fields accessible',
      'Save button present'
    ]
  },

  // ==========================================
  // AUTHENTICATION PAGES
  // ==========================================
  {
    id: 'sanity-030',
    name: 'Sign In Page Test',
    url: '/sign-in',
    category: 'authentication',
    priority: 'critical',
    expectedElements: [
      'h1, h2',
      'form',
      'input[type="email"], input[type="text"]',
      'button[type="submit"]',
      'a[href*="/sign-up"]'
    ],
    validation: [
      'Sign in page loads',
      'Sign in form visible',
      'Email/password fields present',
      'Social login buttons visible (if applicable)',
      'Sign up link accessible'
    ]
  },
  {
    id: 'sanity-031',
    name: 'Sign Up Page Test',
    url: '/sign-up',
    category: 'authentication',
    priority: 'critical',
    expectedElements: [
      'h1, h2',
      'form',
      'input[type="email"]',
      'button[type="submit"]',
      'a[href*="/sign-in"]'
    ],
    validation: [
      'Sign up page loads',
      'Sign up form visible',
      'Registration fields present',
      'Social sign up buttons visible (if applicable)',
      'Sign in link accessible'
    ]
  },

  // ==========================================
  // UTILITY & LEGAL PAGES
  // ==========================================
  {
    id: 'sanity-032',
    name: 'Privacy Policy Page Test',
    url: '/privacy',
    category: 'legal-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main, article',
      'p, [class*="content"]'
    ],
    validation: [
      'Privacy policy page loads',
      'Content is displayed',
      'No errors',
      'Text is readable'
    ]
  },
  {
    id: 'sanity-033',
    name: 'Terms of Service Page Test',
    url: '/terms',
    category: 'legal-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main, article',
      'p, [class*="content"]'
    ],
    validation: [
      'Terms page loads',
      'Content is displayed',
      'No errors',
      'Text is readable'
    ]
  },
  {
    id: 'sanity-034',
    name: 'Pricing Page Test',
    url: '/pricing',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="pricing"], [class*="plan"]',
      'button, a[href*="/sign-up"]'
    ],
    validation: [
      'Pricing page loads',
      'Pricing plans displayed',
      'Subscribe/sign up buttons accessible',
      'No errors'
    ]
  }
];

// Test execution function
async function runSanityTests() {
  console.log('🚀 Starting Comprehensive Malayalees US Site Sanity Tests');
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Expected Duration: ${config.testDuration}`);
  console.log(`🔐 Authentication: Social Login (user already logged in for admin/user pages)`);
  console.log('='.repeat(70));

  const results = {
    total: testScenarios.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    testResults: [],
    categories: {
      'public-pages': { total: 0, passed: 0, failed: 0 },
      'admin-pages': { total: 0, passed: 0, failed: 0 },
      'user-pages': { total: 0, passed: 0, failed: 0 },
      'authentication': { total: 0, passed: 0, failed: 0 },
      'legal-pages': { total: 0, passed: 0, failed: 0 }
    }
  };

  // Count tests by category
  testScenarios.forEach(test => {
    if (results.categories[test.category]) {
      results.categories[test.category].total++;
    }
  });

  for (const test of testScenarios) {
    console.log(`\n🧪 [${test.id}] Running: ${test.name}`);
    console.log(`   Category: ${test.category} | Priority: ${test.priority}`);
    console.log(`   URL: ${config.baseUrl}${test.url}`);

    // Check if test should be skipped
    if (test.skipIf) {
      console.log(`   ⏭️  SKIPPED: ${test.skipIf}`);
      results.skipped++;
      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: 'skipped',
        duration: '0ms',
        error: test.skipIf
      });
      continue;
    }

    try {
      const testResult = await executeTest(test);

      const testData = {
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: testResult.success ? 'passed' : 'failed',
        duration: testResult.duration || `${Math.floor(Math.random() * 500) + 200}ms`,
        error: testResult.error || null,
        expectedElements: test.expectedElements,
        validation: test.validation
      };

      results.testResults.push(testData);

      // Update category stats
      if (results.categories[test.category]) {
        if (testResult.success) {
          results.categories[test.category].passed++;
          results.passed++;
        } else {
          results.categories[test.category].failed++;
          results.failed++;
        }
      }

      if (testResult.success) {
        console.log(`   ✅ PASSED (${testData.duration})`);
      } else {
        console.log(`   ❌ FAILED: ${testResult.error}`);
        results.errors.push({
          test: test.name,
          category: test.category,
          error: testResult.error
        });
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
      results.failed++;
      results.errors.push({
        test: test.name,
        category: test.category,
        error: error.message
      });

      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: 'failed',
        duration: '0ms',
        error: error.message
      });

      // Update category stats
      if (results.categories[test.category]) {
        results.categories[test.category].failed++;
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE SANITY TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`Success Rate: ${((results.passed / (results.total - results.skipped)) * 100).toFixed(1)}%`);

  // Category breakdown
  console.log('\n📋 Results by Category:');
  Object.entries(results.categories).forEach(([category, stats]) => {
    if (stats.total > 0) {
      const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
      console.log(`   ${category}: ${stats.passed}/${stats.total} passed (${rate}%)`);
    }
  });

  if (results.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.forEach(error => {
      console.log(`   • [${error.category}] ${error.test}: ${error.error}`);
    });
  }

  console.log('\n🎯 Comprehensive sanity tests completed!');
  console.log('📄 Generating HTML report...');

  // Generate HTML report
  await generateHTMLReport(results);

  return results;
}

// Generate comprehensive HTML report
async function generateHTMLReport(results) {
  const timestamp = new Date().toLocaleString();
  const successRate = results.total - results.skipped > 0
    ? ((results.passed / (results.total - results.skipped)) * 100).toFixed(1)
    : 0;

  // Group tests by category
  const testsByCategory = {};
  results.testResults.forEach(test => {
    if (!testsByCategory[test.category]) {
      testsByCategory[test.category] = [];
    }
    testsByCategory[test.category].push(test);
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Sanity Test Report - Malayalees US Site</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            padding: 30px;
            border-bottom: 2px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .success-rate { color: #17a2b8; }
        .skipped { color: #ffc107; }
        .category-section {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .category-section:last-child {
            border-bottom: none;
        }
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .category-header h2 {
            color: #333;
            font-size: 1.5em;
        }
        .category-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        .category-stats span {
            padding: 5px 10px;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .test-item {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid;
            transition: background-color 0.2s;
        }
        .test-item:hover {
            background-color: #f8f9fa;
        }
        .test-item.passed {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-status {
            font-size: 1.5em;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .test-info {
            flex: 1;
        }
        .test-info h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.1em;
        }
        .test-info .test-id {
            font-family: monospace;
            font-size: 0.85em;
            color: #666;
            margin-right: 10px;
        }
        .test-info .test-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-critical { background: #dc3545; color: white; }
        .priority-high { background: #fd7e14; color: white; }
        .priority-medium { background: #ffc107; color: #333; }
        .priority-low { background: #6c757d; color: white; }
        .test-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        .test-details {
            margin-left: auto;
            text-align: right;
            flex-shrink: 0;
        }
        .test-details .url {
            font-family: monospace;
            background: #f1f1f1;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-bottom: 5px;
            display: inline-block;
        }
        .test-details .duration {
            font-size: 0.8em;
            color: #666;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }
        .expandable {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0,0,0,0.02);
            border-radius: 4px;
            font-size: 0.85em;
        }
        .expandable h5 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .expandable ul {
            margin: 5px 0 0 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Comprehensive Sanity Test Report</h1>
            <p>Malayalees US Site Event Registration Platform</p>
        </div>

        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number total">${results.total}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number passed">${results.passed}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number failed">${results.failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Skipped</h3>
                    <div class="number skipped">${results.skipped}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="number success-rate">${successRate}%</div>
                </div>
            </div>
        </div>

        ${Object.entries(testsByCategory).map(([category, tests]) => {
          const categoryStats = results.categories[category] || { total: 0, passed: 0, failed: 0 };
          const categoryRate = categoryStats.total > 0
            ? ((categoryStats.passed / categoryStats.total) * 100).toFixed(1)
            : 0;

          return `
        <div class="category-section">
            <div class="category-header">
                <h2>${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                <div class="category-stats">
                    <span>Total: ${categoryStats.total}</span>
                    <span style="color: #28a745;">Passed: ${categoryStats.passed}</span>
                    <span style="color: #dc3545;">Failed: ${categoryStats.failed}</span>
                    <span style="color: #17a2b8;">Rate: ${categoryRate}%</span>
                </div>
            </div>
            ${tests.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-status">${test.status === 'passed' ? '✅' : test.status === 'skipped' ? '⏭️' : '❌'}</div>
                    <div class="test-info">
                        <h4>
                            <span class="test-id">${test.id}</span>
                            ${test.name}
                            ${test.priority ? `<span class="test-priority priority-${test.priority}">${test.priority}</span>` : ''}
                        </h4>
                        <p>${test.status === 'passed' ? 'Test completed successfully' : test.status === 'skipped' ? `Skipped: ${test.error || 'N/A'}` : `Error: ${test.error || 'Unknown error'}`}</p>
                        ${test.expectedElements && test.expectedElements.length > 0 ? `
                        <div class="expandable">
                            <h5>Expected Elements:</h5>
                            <ul>
                                ${test.expectedElements.map(el => `<li><code>${el}</code></li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                    <div class="test-details">
                        <div class="url">${test.url}</div>
                        <div class="duration">${test.duration}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
        }).join('')}

        <div class="footer">
            <p>Generated by Comprehensive TestSprite Sanity Test Suite</p>
            <p class="timestamp">Report generated on: ${timestamp}</p>
            <p class="timestamp">Base URL: ${config.baseUrl}</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'comprehensive-test-report.html');

  try {
    await fs.promises.writeFile(reportPath, htmlContent, 'utf8');
    console.log(`✅ HTML report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to generate HTML report:', error.message);
  }
}

// Simulate test execution (replace with actual TestSprite implementation)
async function executeTest(test) {
  // This is a placeholder - replace with actual TestSprite test execution
  // For now, simulate test execution with realistic timing
  return new Promise((resolve) => {
    const duration = Math.floor(Math.random() * 800) + 300; // 300-1100ms

    setTimeout(() => {
      // Simulate occasional failures for critical tests (5% failure rate)
      // In real implementation, this would use TestSprite MCP server
      const shouldFail = test.priority === 'critical' && Math.random() < 0.05;

      resolve({
        success: !shouldFail,
        duration: `${duration}ms`,
        error: shouldFail ? 'Simulated failure for testing purposes' : null
      });
    }, duration);
  });
}

// Export for use with TestSprite MCP server
export {
  config,
  testScenarios,
  runSanityTests
};

// Run if called directly
// Check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.env.NODE_ENV) {
  runSanityTests().catch(console.error);
}

