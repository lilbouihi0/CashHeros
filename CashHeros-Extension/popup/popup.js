// Popup script for CashHeros extension

// DOM elements
const couponsTab = document.getElementById('couponsTab');
const cashbackTab = document.getElementById('cashbackTab');
const couponsContent = document.getElementById('couponsContent');
const cashbackContent = document.getElementById('cashbackContent');
const couponList = document.getElementById('couponList');
const cashbackList = document.getElementById('cashbackList');
const couponSearch = document.getElementById('couponSearch');
const cashbackSearch = document.getElementById('cashbackSearch');
const currentStoreCoupons = document.getElementById('currentStoreCoupons');
const optionsButton = document.getElementById('optionsButton');

// Tab switching
couponsTab.addEventListener('click', () => {
  couponsTab.classList.add('active');
  cashbackTab.classList.remove('active');
  couponsContent.classList.add('active');
  cashbackContent.classList.remove('active');
});

cashbackTab.addEventListener('click', () => {
  cashbackTab.classList.add('active');
  couponsTab.classList.remove('active');
  cashbackContent.classList.add('active');
  couponsContent.classList.remove('active');
});

// Options button
optionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Load coupons from API
function loadCoupons() {
  couponList.innerHTML = '<div class="loading">Loading coupons...</div>';
  
  chrome.runtime.sendMessage({ action: 'GET_COUPONS' }, (response) => {
    if (response.error) {
      couponList.innerHTML = `<div class="error">Error loading coupons: ${response.error}</div>`;
      return;
    }
    
    if (!response.coupons || response.coupons.length === 0) {
      couponList.innerHTML = '<div class="empty">No coupons available at the moment.</div>';
      return;
    }
    
    displayCoupons(response.coupons);
  });
}

// Load cashback offers from API
function loadCashback() {
  cashbackList.innerHTML = '<div class="loading">Loading cashback offers...</div>';
  
  chrome.runtime.sendMessage({ action: 'GET_CASHBACK' }, (response) => {
    if (response.error) {
      cashbackList.innerHTML = `<div class="error">Error loading cashback offers: ${response.error}</div>`;
      return;
    }
    
    if (!response.cashback || response.cashback.length === 0) {
      cashbackList.innerHTML = '<div class="empty">No cashback offers available at the moment.</div>';
      return;
    }
    
    displayCashback(response.cashback);
  });
}

// Display coupons in the list
function displayCoupons(coupons) {
  couponList.innerHTML = '';
  
  coupons.forEach(coupon => {
    const couponCard = document.createElement('div');
    couponCard.className = 'coupon-card';
    
    const expiryDate = new Date(coupon.expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    couponCard.innerHTML = `
      <div class="coupon-store">${coupon.store}</div>
      <div class="coupon-description">${coupon.description}</div>
      <div class="coupon-code">${coupon.code}</div>
      <div class="coupon-expiry">Expires in ${daysLeft} days</div>
      <div class="coupon-actions">
        <button class="copy-btn" data-code="${coupon.code}">Copy Code</button>
        <button class="visit-btn" data-url="${coupon.url}">Visit Store</button>
      </div>
    `;
    
    couponList.appendChild(couponCard);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const code = e.target.getAttribute('data-code');
      navigator.clipboard.writeText(code)
        .then(() => {
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Copy Code';
          }, 2000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    });
  });
  
  document.querySelectorAll('.visit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const url = e.target.getAttribute('data-url');
      chrome.tabs.create({ url });
    });
  });
}

// Display cashback offers in the list
function displayCashback(cashbackOffers) {
  cashbackList.innerHTML = '';
  
  cashbackOffers.forEach(offer => {
    const cashbackCard = document.createElement('div');
    cashbackCard.className = 'cashback-card';
    
    cashbackCard.innerHTML = `
      <div class="cashback-store">${offer.store}</div>
      <div class="cashback-description">${offer.percentage}% Cash Back</div>
      <div class="cashback-description">${offer.description}</div>
      <div class="cashback-expiry">Expires on ${new Date(offer.expiryDate).toLocaleDateString()}</div>
      <div class="cashback-actions">
        <button class="visit-btn" data-url="${offer.url}">Activate & Shop</button>
      </div>
    `;
    
    cashbackList.appendChild(cashbackCard);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.visit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const url = e.target.getAttribute('data-url');
      chrome.tabs.create({ url });
    });
  });
}

// Check if we're on a supported store
function checkCurrentStore() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname.replace('www.', '');
      
      // List of supported stores (should match the ones in background.js)
      const supportedStores = {
        'amazon.com': 'Amazon',
        'walmart.com': 'Walmart',
        'target.com': 'Target',
        'bestbuy.com': 'Best Buy'
      };
      
      for (const [storeDomain, storeName] of Object.entries(supportedStores)) {
        if (domain.includes(storeDomain)) {
          // We're on a supported store, show relevant coupons
          showStoreSpecificCoupons(storeName);
          break;
        }
      }
    }
  });
}

// Show coupons for the current store
function showStoreSpecificCoupons(storeName) {
  chrome.runtime.sendMessage({ 
    action: 'GET_COUPONS',
    store: storeName 
  }, (response) => {
    if (response.error || !response.coupons || response.coupons.length === 0) {
      return;
    }
    
    // Filter coupons for this store
    const storeCoupons = response.coupons.filter(coupon => 
      coupon.store.toLowerCase() === storeName.toLowerCase()
    );
    
    if (storeCoupons.length > 0) {
      currentStoreCoupons.innerHTML = `
        <h3>${storeName} Coupons</h3>
        <p>We found ${storeCoupons.length} coupons for this store!</p>
        <button id="showStoreCoupons">View Coupons</button>
      `;
      
      currentStoreCoupons.classList.add('active');
      
      document.getElementById('showStoreCoupons').addEventListener('click', () => {
        displayCoupons(storeCoupons);
      });
    }
  });
}

// Search functionality
couponSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  chrome.runtime.sendMessage({ action: 'GET_COUPONS' }, (response) => {
    if (response.error || !response.coupons) return;
    
    const filteredCoupons = response.coupons.filter(coupon => 
      coupon.store.toLowerCase().includes(searchTerm) || 
      coupon.description.toLowerCase().includes(searchTerm)
    );
    
    displayCoupons(filteredCoupons);
  });
});

cashbackSearch.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  chrome.runtime.sendMessage({ action: 'GET_CASHBACK' }, (response) => {
    if (response.error || !response.cashback) return;
    
    const filteredCashback = response.cashback.filter(offer => 
      offer.store.toLowerCase().includes(searchTerm) || 
      offer.description.toLowerCase().includes(searchTerm)
    );
    
    displayCashback(filteredCashback);
  });
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadCoupons();
  loadCashback();
  checkCurrentStore();
});

// Mock data for testing (remove in production)
function loadMockData() {
  const mockCoupons = [
    {
      store: 'Amazon',
      description: '20% off Electronics',
      code: 'TECH20',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://amazon.com'
    },
    {
      store: 'Walmart',
      description: '$10 off orders over $50',
      code: 'SAVE10',
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://walmart.com'
    },
    {
      store: 'Target',
      description: 'Buy one get one free on clothing',
      code: 'BOGO2023',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://target.com'
    }
  ];
  
  const mockCashback = [
    {
      store: 'Amazon',
      percentage: 3,
      description: '3% cash back on all purchases',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://cashheros.com/redirect/amazon'
    },
    {
      store: 'Walmart',
      percentage: 2,
      description: '2% cash back on all purchases',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://cashheros.com/redirect/walmart'
    },
    {
      store: 'Best Buy',
      percentage: 5,
      description: '5% cash back on electronics',
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://cashheros.com/redirect/bestbuy'
    }
  ];
  
  displayCoupons(mockCoupons);
  displayCashback(mockCashback);
}

// Uncomment to use mock data for testing
// loadMockData();