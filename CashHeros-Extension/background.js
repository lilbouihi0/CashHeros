// Background script for CashHeros extension
// This runs in the background and handles events like notifications, API calls, etc.

// API endpoint for fetching coupons
const API_BASE_URL = 'https://api.cashheros.com';
const COUPON_ENDPOINT = '/api/coupons';
const CASHBACK_ENDPOINT = '/api/cashback';

// Store mappings for detecting which store the user is on
const STORE_DOMAINS = {
  'amazon.com': 'Amazon',
  'walmart.com': 'Walmart',
  'target.com': 'Target',
  'bestbuy.com': 'Best Buy',
  'ebay.com': 'eBay',
  'newegg.com': 'Newegg',
  'homedepot.com': 'Home Depot',
  'lowes.com': 'Lowes',
  'macys.com': 'Macys',
  'kohls.com': 'Kohls',
  'nordstrom.com': 'Nordstrom',
  'gap.com': 'Gap',
  'oldnavy.com': 'Old Navy',
  'nike.com': 'Nike',
  'adidas.com': 'Adidas'
};

// Check for new coupons periodically
async function checkForNewCoupons() {
  try {
    const response = await fetch(`${API_BASE_URL}${COUPON_ENDPOINT}/latest`);
    const data = await response.json();
    
    if (data.newCoupons && data.newCoupons.length > 0) {
      // Show notification for new coupons
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'New Coupons Available!',
        message: `${data.newCoupons.length} new coupons available on CashHeros!`,
        buttons: [{ title: 'View Coupons' }]
      });
    }
  } catch (error) {
    console.error('Error checking for new coupons:', error);
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Set default options
  chrome.storage.sync.set({
    notificationsEnabled: true,
    autoCouponApply: true,
    cashbackReminders: true
  });
  
  // Create alarm for checking new coupons
  chrome.alarms.create('checkNewCoupons', { periodInMinutes: 60 });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkNewCoupons') {
    checkForNewCoupons();
  }
});

// Listen for tab updates to detect when user navigates to a supported store
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the current site is a supported store
    const url = new URL(tab.url);
    const domain = url.hostname.replace('www.', '');
    
    for (const [storeDomain, storeName] of Object.entries(STORE_DOMAINS)) {
      if (domain.includes(storeDomain)) {
        // Notify content script that we're on a supported store
        chrome.tabs.sendMessage(tabId, { 
          action: 'STORE_DETECTED',
          store: storeName
        });
        
        // Fetch relevant coupons for this store
        fetchCouponsForStore(storeName, tabId);
        break;
      }
    }
  }
});

// Fetch offers (coupons and cashback) for a specific store
async function fetchCouponsForStore(storeName, tabId) {
  try {
    // Fetch coupons
    const couponResponse = await fetch(`${API_BASE_URL}${COUPON_ENDPOINT}/store/${storeName}`);
    const couponData = await couponResponse.json();
    
    // Fetch cashback
    const cashbackResponse = await fetch(`${API_BASE_URL}${CASHBACK_ENDPOINT}/store/${storeName}`);
    const cashbackData = await cashbackResponse.json();
    
    // Send combined offers to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'OFFERS_AVAILABLE',
      store: storeName,
      coupons: couponData.coupons || [],
      cashback: cashbackData.cashback || null
    });
  } catch (error) {
    console.error(`Error fetching offers for ${storeName}:`, error);
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_COUPONS') {
    // Fetch coupons and send back to popup
    fetch(`${API_BASE_URL}${COUPON_ENDPOINT}`)
      .then(response => response.json())
      .then(data => sendResponse({ coupons: data.coupons }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'GET_CASHBACK') {
    // Fetch cashback offers and send back to popup
    fetch(`${API_BASE_URL}${CASHBACK_ENDPOINT}`)
      .then(response => response.json())
      .then(data => sendResponse({ cashback: data.cashback }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Required for async sendResponse
  }
  
  if (message.action === 'ACTIVATE_CASHBACK') {
    // Open cashback activation page in a new tab
    chrome.tabs.create({
      url: `https://cashheros.com/cashback/activate?store=${encodeURIComponent(message.store)}`
    });
  }
});