# CashHeros Browser Extension

A browser extension for CashHeros that helps users find and apply coupons and cashback offers while shopping online.

## Features

- **Automatic Coupon Detection**: Automatically detects when you're on a supported shopping website
- **Coupon Suggestions**: Shows relevant coupons for the store you're browsing
- **Auto-fill Coupon Codes**: Easily copy and apply coupon codes with one click
- **Cashback Reminders**: Get reminded to activate cashback when checking out
- **New Coupon Notifications**: Stay updated when new coupons are available
- **Buy Button Enhancement**: Shows coupon and cashback availability directly next to buy buttons
- **Interactive Tooltips**: Hover over the CashHeros button to see available offers
- **Seamless Integration**: Buttons blend naturally with the website's design

## Supported Stores

- Amazon
- Walmart
- Target
- Best Buy
- eBay
- Newegg
- Home Depot
- Lowes
- Macys
- Kohls
- Nordstrom
- Gap
- Old Navy
- Nike
- Adidas
- (More stores can be added in the manifest.json file)

## Installation Instructions

### For Development/Testing

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the `CashHeros-Extension` folder
5. The extension should now be installed and visible in your browser toolbar

### For Production (Chrome Web Store)

1. Create a ZIP file of the extension folder
2. Create a developer account on the Chrome Web Store
3. Upload the ZIP file to the Chrome Web Store Developer Dashboard
4. Fill in the required information and submit for review
5. Once approved, users can install directly from the Chrome Web Store

## Directory Structure

```
CashHeros-Extension/
├── manifest.json        # Extension configuration
├── background.js        # Background service worker
├── popup/               # Popup UI when clicking extension icon
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/             # Content scripts injected into web pages
│   ├── content.js
│   └── content.css
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
└── options/             # Settings page
    ├── options.html
    ├── options.css
    └── options.js
```

## Development

### Adding New Stores

To add support for new stores, update the `STORE_DOMAINS` object in `background.js` and add the domain pattern to the `matches` array in `manifest.json`.

### API Integration

The extension is designed to work with the CashHeros API. Update the API endpoints in `background.js` to point to your actual API:

```javascript
const API_BASE_URL = 'https://api.cashheros.com';
const COUPON_ENDPOINT = '/api/coupons';
const CASHBACK_ENDPOINT = '/api/cashback';
```

### Testing

1. Load the extension in developer mode
2. Visit supported stores (Amazon, Walmart, etc.)
3. The extension should detect the store and display available coupons
4. Test the coupon copy and auto-fill functionality
5. Test the cashback reminder on checkout pages

## Customization

### Colors and Branding

The extension uses the CashHeros brand colors. To customize:

1. Update the CSS variables in `popup/popup.css` and `options/options.css`
2. Replace the icon files in the `icons` directory with your own

### Notification Settings

Users can customize notification preferences in the extension options page.

## License

[Your License Information]

## Contact

For support or inquiries, contact [your contact information]