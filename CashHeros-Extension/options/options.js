// Options script for CashHeros extension

// DOM elements
const notificationsEnabled = document.getElementById('notificationsEnabled');
const cashbackReminders = document.getElementById('cashbackReminders');
const autoCouponApply = document.getElementById('autoCouponApply');
const showCouponOverlay = document.getElementById('showCouponOverlay');
const saveButton = document.getElementById('saveButton');
const statusMessage = document.getElementById('statusMessage');

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(
    {
      // Default values
      notificationsEnabled: true,
      cashbackReminders: true,
      autoCouponApply: true,
      showCouponOverlay: true
    },
    (items) => {
      // Update UI with saved settings
      notificationsEnabled.checked = items.notificationsEnabled;
      cashbackReminders.checked = items.cashbackReminders;
      autoCouponApply.checked = items.autoCouponApply;
      showCouponOverlay.checked = items.showCouponOverlay;
    }
  );
}

// Save settings
function saveSettings() {
  chrome.storage.sync.set(
    {
      notificationsEnabled: notificationsEnabled.checked,
      cashbackReminders: cashbackReminders.checked,
      autoCouponApply: autoCouponApply.checked,
      showCouponOverlay: showCouponOverlay.checked
    },
    () => {
      // Update status to let user know settings were saved
      statusMessage.textContent = 'Settings saved!';
      statusMessage.style.color = '#4caf50';
      
      // Clear the status message after 2 seconds
      setTimeout(() => {
        statusMessage.textContent = '';
      }, 2000);
    }
  );
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);

// Add individual change listeners for immediate effect
notificationsEnabled.addEventListener('change', () => {
  // If notifications are disabled, clear any existing alarms
  if (!notificationsEnabled.checked) {
    chrome.alarms.clear('checkNewCoupons');
  } else {
    // Re-create the alarm if enabled
    chrome.alarms.create('checkNewCoupons', { periodInMinutes: 60 });
  }
});

// Reset overlay dismissed state when overlay setting is changed
showCouponOverlay.addEventListener('change', () => {
  if (showCouponOverlay.checked) {
    // Reset the dismissed state so overlay can show again
    chrome.storage.sync.remove('overlayDismissed');
  }
});