// Content script for CashHeros extension
// This script runs on the web pages that match the patterns in manifest.json

// Store-specific selectors for buy buttons
const BUY_BUTTON_SELECTORS = {
  'Amazon': [
    '#buy-now-button',
    '#add-to-cart-button',
    '.a-button-input[name="submit.buy-now"]'
  ],
  'Walmart': [
    '.button.spin-button.prod-ProductCTA--primary',
    'button[data-tl-id="ProductPrimaryCTA-button"]',
    'button.add-to-cart-btn'
  ],
  'Target': [
    'button[data-test="shipItButton"]',
    'button[data-test="addToCartButton"]',
    'button.Button__StyledButton-sc-1vydk7'
  ],
  'Best Buy': [
    '.add-to-cart-button',
    '.btn-primary.add-to-cart',
    'button.add-to-cart-button'
  ],
  'eBay': [
    '.btn.btn--primary.btn--large',
    '#binBtn_btn',
    '#atcRedesignId_btn'
  ],
  'Newegg': [
    '.btn-primary.btn-wide',
    '.btn.btn-primary.btn-wide',
    'button.btn-primary'
  ],
  'Home Depot': [
    '#atc_shipIt',
    '.bttn.bttn--primary',
    'button[data-automation-id="add-to-cart"]'
  ],
  'Lowes': [
    '.add-to-cart-btn',
    'button[data-selector="addToCartButton"]',
    '.button.primary'
  ],
  'Macys': [
    '#bag-add-btn',
    '.button.primary.expanded.add-to-bag',
    'button.pdp-add-to-bag'
  ],
  'Kohls': [
    '#addtobag',
    '.pdp-add-to-bag-btn',
    'button.add-to-cart'
  ],
  'Nordstrom': [
    '._2oZMH',
    'button[aria-label="Add to Bag"]',
    'button.add-to-bag'
  ],
  'Gap': [
    '.add-to-bag',
    '#addToBag',
    'button.add-to-cart-btn'
  ],
  'Old Navy': [
    '.add-to-bag',
    '#addToBag',
    'button.add-to-cart-btn'
  ],
  'Nike': [
    '.add-to-cart-btn',
    'button.ncss-btn-primary',
    'button[data-test="add-to-cart"]'
  ],
  'Adidas': [
    '.add-to-bag',
    'button.gl-cta--primary',
    'button[data-auto-id="add-to-bag"]'
  ]
};

// Create and inject the coupon overlay
function createCouponOverlay() {
  // Check if overlay already exists
  if (document.getElementById('cashheros-overlay')) {
    return document.getElementById('cashheros-overlay');
  }
  
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'cashheros-overlay';
  overlay.className = 'cashheros-overlay';
  
  // Create overlay content
  overlay.innerHTML = `
    <div class="cashheros-header">
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="CashHeros Logo">
      <span>CashHeros</span>
      <button id="cashheros-close">×</button>
    </div>
    <div class="cashheros-content">
      <div id="cashheros-message">Looking for coupons...</div>
      <div id="cashheros-coupons"></div>
    </div>
  `;
  
  // Append overlay to body
  document.body.appendChild(overlay);
  
  // Add event listener to close button
  document.getElementById('cashheros-close').addEventListener('click', () => {
    overlay.classList.add('cashheros-hidden');
    
    // Remember that user closed the overlay
    chrome.storage.sync.set({ overlayDismissed: Date.now() });
  });
  
  // Add minimize/maximize functionality
  const header = overlay.querySelector('.cashheros-header');
  header.addEventListener('click', (e) => {
    if (e.target !== document.getElementById('cashheros-close')) {
      overlay.classList.toggle('cashheros-minimized');
    }
  });
  
  return overlay;
}

// Display coupons in the overlay
function displayCoupons(coupons) {
  const overlay = document.getElementById('cashheros-overlay') || createCouponOverlay();
  const couponsContainer = document.getElementById('cashheros-coupons');
  const messageElement = document.getElementById('cashheros-message');
  
  if (coupons.length === 0) {
    messageElement.textContent = 'No coupons available for this store.';
    return;
  }
  
  messageElement.textContent = `${coupons.length} coupons found for this store!`;
  couponsContainer.innerHTML = '';
  
  coupons.forEach(coupon => {
    const couponElement = document.createElement('div');
    couponElement.className = 'cashheros-coupon';
    
    couponElement.innerHTML = `
      <div class="cashheros-coupon-description">${coupon.description}</div>
      <div class="cashheros-coupon-code">${coupon.code}</div>
      <button class="cashheros-copy-btn" data-code="${coupon.code}">Copy Code</button>
    `;
    
    couponsContainer.appendChild(couponElement);
  });
  
  // Add event listeners to copy buttons
  document.querySelectorAll('.cashheros-copy-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const code = e.target.getAttribute('data-code');
      navigator.clipboard.writeText(code)
        .then(() => {
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Copy Code';
          }, 2000);
          
          // Try to find and fill coupon field
          tryFillCouponField(code);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    });
  });
  
  // Show the overlay
  overlay.classList.remove('cashheros-hidden');
}

// Try to find and fill coupon field on the page
function tryFillCouponField(code) {
  // Common coupon field selectors
  const couponSelectors = [
    'input[name="coupon"]',
    'input[name="couponCode"]',
    'input[name="discount"]',
    'input[name="discountCode"]',
    'input[name="voucherCode"]',
    'input[name="promoCode"]',
    'input[id*="coupon"]',
    'input[id*="discount"]',
    'input[id*="promo"]',
    'input[placeholder*="coupon"]',
    'input[placeholder*="discount"]',
    'input[placeholder*="promo"]'
  ];
  
  // Try to find a coupon field
  for (const selector of couponSelectors) {
    const couponField = document.querySelector(selector);
    if (couponField) {
      // Fill the field
      couponField.value = code;
      
      // Trigger input event to notify the page
      couponField.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Show success message
      const messageElement = document.getElementById('cashheros-message');
      messageElement.textContent = 'Coupon code applied!';
      
      return true;
    }
  }
  
  return false;
}

// Check if we should show cashback notification
function checkCashbackEligibility(store) {
  // Check if we're on a checkout page
  const isCheckoutPage = window.location.href.toLowerCase().includes('checkout') ||
                         window.location.href.toLowerCase().includes('payment') ||
                         window.location.href.toLowerCase().includes('cart');
  
  if (isCheckoutPage) {
    showCashbackReminder(store);
  }
}

// Show cashback reminder
function showCashbackReminder(store) {
  // Check user preferences
  chrome.storage.sync.get(['cashbackReminders'], (result) => {
    if (result.cashbackReminders === false) {
      return;
    }
    
    const overlay = document.getElementById('cashheros-overlay') || createCouponOverlay();
    const messageElement = document.getElementById('cashheros-message');
    const couponsContainer = document.getElementById('cashheros-coupons');
    
    messageElement.textContent = `Don't forget to activate your cashback for ${store}!`;
    
    couponsContainer.innerHTML = `
      <div class="cashheros-cashback-reminder">
        <p>Earn up to 5% cashback on your purchase</p>
        <button id="cashheros-activate-cashback">Activate Cashback</button>
      </div>
    `;
    
    document.getElementById('cashheros-activate-cashback').addEventListener('click', () => {
      // Open cashback activation in new tab
      chrome.runtime.sendMessage({
        action: 'ACTIVATE_CASHBACK',
        store: store
      });
      
      messageElement.textContent = 'Cashback activated! Complete your purchase to earn rewards.';
      couponsContainer.innerHTML = '';
    });
    
    overlay.classList.remove('cashheros-hidden');
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'STORE_DETECTED') {
    // Store detected, wait for coupons
    createCouponOverlay();
    
    // Check if we should show cashback reminder
    checkCashbackEligibility(message.store);
  }
  
  if (message.action === 'COUPONS_AVAILABLE') {
    // Display coupons in the overlay if user has enabled notifications
    chrome.storage.sync.get(['notificationsEnabled'], (result) => {
      if (result.notificationsEnabled !== false) {
        // Only show the overlay if there are coupons
        if (message.coupons && message.coupons.length > 0) {
          displayCoupons(message.coupons);
        }
      }
    });
    
    // Process offers and inject buttons regardless of notification settings
    processOffers(message.store, { coupons: message.coupons });
  }
  
  if (message.action === 'CASHBACK_AVAILABLE') {
    // Process cashback offers and inject buttons
    processOffers(message.store, { cashback: message.cashback });
  }
  
  if (message.action === 'OFFERS_AVAILABLE') {
    // Process all offers (both coupons and cashback)
    processOffers(message.store, { 
      coupons: message.coupons,
      cashback: message.cashback
    });
  }
});

// Find buy buttons on the page based on the current store
function findBuyButtons(store) {
  if (!BUY_BUTTON_SELECTORS[store]) {
    return [];
  }
  
  let buttons = [];
  for (const selector of BUY_BUTTON_SELECTORS[store]) {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      buttons = [...buttons, ...found];
    }
  }
  
  return buttons;
}

// Create and inject a CashHeros button next to a buy button
function injectCashHerosButton(buyButton, offerData) {
  // Check if button already exists
  const existingButton = buyButton.parentNode.querySelector('.cashheros-buy-button');
  if (existingButton) {
    return existingButton;
  }
  
  // Create container for our button (to control positioning)
  const container = document.createElement('div');
  container.className = 'cashheros-button-container';
  
  // Create the button
  const button = document.createElement('button');
  button.className = 'cashheros-buy-button';
  
  // Set button text based on offer type
  if (offerData.coupons && offerData.coupons.length > 0) {
    button.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="CashHeros"> ${offerData.coupons.length} Coupons`;
    button.setAttribute('data-offer-type', 'coupon');
  } else if (offerData.cashback) {
    button.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="CashHeros"> ${offerData.cashback.rate}% Cashback`;
    button.setAttribute('data-offer-type', 'cashback');
  }
  
  // Add tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'cashheros-tooltip';
  
  if (offerData.coupons && offerData.coupons.length > 0) {
    tooltip.innerHTML = `
      <div class="cashheros-tooltip-header">Available Coupons</div>
      <div class="cashheros-tooltip-content">
        ${offerData.coupons.slice(0, 3).map(coupon => 
          `<div class="cashheros-tooltip-coupon">${coupon.description}</div>`
        ).join('')}
        ${offerData.coupons.length > 3 ? `<div class="cashheros-tooltip-more">+${offerData.coupons.length - 3} more</div>` : ''}
      </div>
      <div class="cashheros-tooltip-footer">Click to view all coupons</div>
    `;
  } else if (offerData.cashback) {
    tooltip.innerHTML = `
      <div class="cashheros-tooltip-header">Cashback Available</div>
      <div class="cashheros-tooltip-content">
        <div class="cashheros-tooltip-cashback">Earn ${offerData.cashback.rate}% cashback on your purchase</div>
      </div>
      <div class="cashheros-tooltip-footer">Click to activate cashback</div>
    `;
  }
  
  // Add event listener to button
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show the overlay with appropriate content
    if (offerData.coupons && offerData.coupons.length > 0) {
      displayCoupons(offerData.coupons);
    } else if (offerData.cashback) {
      showCashbackReminder(offerData.store);
    }
  });
  
  // Add hover effect for tooltip
  button.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
  });
  
  button.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
  
  // Append elements
  container.appendChild(button);
  container.appendChild(tooltip);
  
  // Insert after the buy button
  if (buyButton.nextSibling) {
    buyButton.parentNode.insertBefore(container, buyButton.nextSibling);
  } else {
    buyButton.parentNode.appendChild(container);
  }
  
  return button;
}

// Process offers and inject buttons
function processOffers(store, offerData) {
  // Find all buy buttons on the page
  const buyButtons = findBuyButtons(store);
  
  if (buyButtons.length > 0) {
    // Inject our button next to each buy button
    buyButtons.forEach(button => {
      injectCashHerosButton(button, { ...offerData, store });
    });
    
    // Set up a mutation observer to detect new buy buttons
    setupButtonObserver(store, offerData);
  }
}

// Set up mutation observer to detect dynamically added buy buttons
function setupButtonObserver(store, offerData) {
  // Create a new observer
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    // Check if any mutations might have added new buttons
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck) {
      // Find new buy buttons
      const buyButtons = findBuyButtons(store);
      
      // Inject our button next to each buy button that doesn't already have one
      buyButtons.forEach(button => {
        const existingButton = button.parentNode.querySelector('.cashheros-buy-button');
        if (!existingButton) {
          injectCashHerosButton(button, { ...offerData, store });
        }
      });
    }
  });
  
  // Start observing the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize content script
function initialize() {
  // Check if we should show the overlay (not recently dismissed)
  chrome.storage.sync.get(['overlayDismissed'], (result) => {
    const lastDismissed = result.overlayDismissed || 0;
    const now = Date.now();
    const hoursSinceLastDismissed = (now - lastDismissed) / (1000 * 60 * 60);
    
    // If it's been more than 4 hours since last dismissed, allow showing again
    if (hoursSinceLastDismissed > 4) {
      // The overlay will be created when coupons are available
    }
  });
}

// Run initialization
initialize();