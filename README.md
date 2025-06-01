# CashHeros - Deals, Coupons & Cash Back

CashHeros is a web application that helps users find the best deals, coupons, and cash back offers from various stores.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

### Option 1: Simple Server (Recommended for now)

If you're experiencing CSS MIME type issues or errors with the CashBackPage, use the simple server with a temporary landing page:

```bash
npm run start:simple
```

This will start a simple server on port 3000 that serves a temporary landing page without any CSS MIME type issues.

### Option 2: Development Mode with CSS Fix

To run the application in development mode with CSS MIME type fixes:

```bash
npm run start:css-fix
```

This will:
1. Start the React development server on port 3000
2. Start the CSS fix proxy server on port 3001
3. Open your browser to http://localhost:3001

### Option 3: Production Mode

To build and run the application in production mode:

```bash
npm run build
npm run serve
```

## Known Issues and Fixes

### CSS MIME Type Issue

If you encounter issues with CSS files not loading correctly, use the CSS fix server:

```bash
npm run serve:css-fix
```

For more details, see [CSS_MIME_FIX.md](./CSS_MIME_FIX.md).

### React Helmet Warnings

The application uses `react-helmet` which may show warnings about `UNSAFE_componentWillMount` in strict mode. This is a known issue with the library.

To fix this warning permanently, you can install `react-helmet-async`:

```bash
npm install react-helmet-async --save
```

Or run the provided script:

```bash
./install-dependencies.bat
```

## Project Structure

- `/src` - Source code
  - `/Components` - Reusable components
  - `/pages` - Page components
  - `/context` - React context providers
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions
- `/public` - Static assets
- `/build` - Production build output

## Available Scripts

- `npm start` - Start the development server
- `npm run start:css-fix` - Start with CSS MIME type fixes
- `npm run build` - Build the application for production
- `npm run serve` - Serve the production build
- `npm run serve:css-fix` - Serve the production build with CSS MIME type fixes
- `npm test` - Run tests
- `npm run analyze` - Analyze the bundle size

## License

This project is licensed under the MIT License - see the LICENSE file for details.