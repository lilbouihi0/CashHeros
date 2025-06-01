/**
 * Frontend Performance Testing Script
 * 
 * This script uses Lighthouse to measure performance metrics for key pages.
 * It can be run in CI/CD pipelines to track performance over time.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Pages to test
const PAGES = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Coupons', url: 'http://localhost:3000/coupons' },
  { name: 'Cashback', url: 'http://localhost:3000/cashback' },
  { name: 'Login', url: 'http://localhost:3000/login' },
  { name: 'Signup', url: 'http://localhost:3000/signup' }
];

// Performance thresholds
const THRESHOLDS = {
  performance: 80,
  accessibility: 90,
  'best-practices': 85,
  seo: 90,
  pwa: 50,
  'first-contentful-paint': 2000,
  'largest-contentful-paint': 2500,
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300,
  'speed-index': 3000
};

// Output directory for reports
const OUTPUT_DIR = path.join(__dirname, 'reports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Run Lighthouse audit for a page
 * @param {string} url - URL to audit
 * @param {object} opts - Lighthouse options
 * @param {object} config - Lighthouse config
 * @returns {Promise<object>} Lighthouse results
 */
async function runLighthouse(url, opts, config) {
  return lighthouse(url, opts, config);
}

/**
 * Check if results meet thresholds
 * @param {object} results - Lighthouse results
 * @returns {object} Threshold check results
 */
function checkThresholds(results) {
  const { categories, audits } = results.lhr;
  
  const checks = {
    performance: {
      score: categories.performance.score * 100,
      threshold: THRESHOLDS.performance,
      pass: categories.performance.score * 100 >= THRESHOLDS.performance
    },
    accessibility: {
      score: categories.accessibility.score * 100,
      threshold: THRESHOLDS.accessibility,
      pass: categories.accessibility.score * 100 >= THRESHOLDS.accessibility
    },
    'best-practices': {
      score: categories['best-practices'].score * 100,
      threshold: THRESHOLDS['best-practices'],
      pass: categories['best-practices'].score * 100 >= THRESHOLDS['best-practices']
    },
    seo: {
      score: categories.seo.score * 100,
      threshold: THRESHOLDS.seo,
      pass: categories.seo.score * 100 >= THRESHOLDS.seo
    },
    pwa: {
      score: categories.pwa.score * 100,
      threshold: THRESHOLDS.pwa,
      pass: categories.pwa.score * 100 >= THRESHOLDS.pwa
    },
    'first-contentful-paint': {
      score: audits['first-contentful-paint'].numericValue,
      threshold: THRESHOLDS['first-contentful-paint'],
      pass: audits['first-contentful-paint'].numericValue <= THRESHOLDS['first-contentful-paint']
    },
    'largest-contentful-paint': {
      score: audits['largest-contentful-paint'].numericValue,
      threshold: THRESHOLDS['largest-contentful-paint'],
      pass: audits['largest-contentful-paint'].numericValue <= THRESHOLDS['largest-contentful-paint']
    },
    'cumulative-layout-shift': {
      score: audits['cumulative-layout-shift'].numericValue,
      threshold: THRESHOLDS['cumulative-layout-shift'],
      pass: audits['cumulative-layout-shift'].numericValue <= THRESHOLDS['cumulative-layout-shift']
    },
    'total-blocking-time': {
      score: audits['total-blocking-time'].numericValue,
      threshold: THRESHOLDS['total-blocking-time'],
      pass: audits['total-blocking-time'].numericValue <= THRESHOLDS['total-blocking-time']
    },
    'speed-index': {
      score: audits['speed-index'].numericValue,
      threshold: THRESHOLDS['speed-index'],
      pass: audits['speed-index'].numericValue <= THRESHOLDS['speed-index']
    }
  };
  
  return checks;
}

/**
 * Save results to file
 * @param {string} pageName - Name of the page
 * @param {object} results - Lighthouse results
 * @param {object} thresholdChecks - Threshold check results
 */
function saveResults(pageName, results, thresholdChecks) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const fileName = `${pageName.toLowerCase()}-${timestamp}.json`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  
  const reportData = {
    url: results.lhr.finalUrl,
    timestamp: results.lhr.fetchTime,
    scores: {
      performance: results.lhr.categories.performance.score * 100,
      accessibility: results.lhr.categories.accessibility.score * 100,
      'best-practices': results.lhr.categories['best-practices'].score * 100,
      seo: results.lhr.categories.seo.score * 100,
      pwa: results.lhr.categories.pwa.score * 100
    },
    metrics: {
      'first-contentful-paint': results.lhr.audits['first-contentful-paint'].numericValue,
      'largest-contentful-paint': results.lhr.audits['largest-contentful-paint'].numericValue,
      'cumulative-layout-shift': results.lhr.audits['cumulative-layout-shift'].numericValue,
      'total-blocking-time': results.lhr.audits['total-blocking-time'].numericValue,
      'speed-index': results.lhr.audits['speed-index'].numericValue,
      'time-to-interactive': results.lhr.audits['interactive'].numericValue,
      'server-response-time': results.lhr.audits['server-response-time'].numericValue
    },
    thresholdChecks
  };
  
  fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  console.log(`Report saved to ${filePath}`);
  
  // Also save the full Lighthouse report
  const htmlReportPath = path.join(OUTPUT_DIR, `${pageName.toLowerCase()}-${timestamp}.html`);
  fs.writeFileSync(htmlReportPath, results.report);
  console.log(`Full HTML report saved to ${htmlReportPath}`);
}

/**
 * Run performance tests for all pages
 */
async function runPerformanceTests() {
  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
    throttling: {
      cpuSlowdownMultiplier: 4,
      downloadThroughputKbps: 1600,
      uploadThroughputKbps: 750,
      rttMs: 150
    }
  };
  
  // Define config
  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    }
  };
  
  // Test each page
  const results = [];
  for (const page of PAGES) {
    console.log(`Testing ${page.name} (${page.url})...`);
    
    try {
      const result = await runLighthouse(page.url, options, config);
      const thresholdChecks = checkThresholds(result);
      
      saveResults(page.name, result, thresholdChecks);
      
      // Check if any thresholds failed
      const failedChecks = Object.entries(thresholdChecks)
        .filter(([_, check]) => !check.pass)
        .map(([metric, check]) => ({
          metric,
          actual: check.score,
          threshold: check.threshold
        }));
      
      results.push({
        page: page.name,
        url: page.url,
        passed: failedChecks.length === 0,
        failedChecks
      });
      
      console.log(`Completed testing ${page.name}`);
    } catch (error) {
      console.error(`Error testing ${page.name}:`, error);
      results.push({
        page: page.name,
        url: page.url,
        passed: false,
        error: error.message
      });
    }
  }
  
  // Close Chrome
  await chrome.kill();
  
  // Print summary
  console.log('\n=== Performance Test Summary ===');
  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.page}: All checks passed`);
    } else if (result.error) {
      console.log(`❌ ${result.page}: Error - ${result.error}`);
    } else {
      console.log(`❌ ${result.page}: Failed checks:`);
      for (const check of result.failedChecks) {
        console.log(`   - ${check.metric}: ${check.actual} (threshold: ${check.threshold})`);
      }
    }
  }
  
  // Determine overall success
  const allPassed = results.every(result => result.passed);
  if (!allPassed) {
    console.log('\n❌ Some performance tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All performance tests passed');
    process.exit(0);
  }
}

// Run the tests
runPerformanceTests().catch(error => {
  console.error('Error running performance tests:', error);
  process.exit(1);
});