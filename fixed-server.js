const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Special handling for CSS files - apply to all CSS requests
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    console.log(`Setting Content-Type for: ${req.url}`);
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Explicit route for CSS files to ensure correct MIME type
app.get('*.css', (req, res, next) => {
  console.log(`Processing CSS: ${req.url}`);
  res.setHeader('Content-Type', 'text/css');
  next();
});

// Serve static CSS files with explicit MIME type
app.use('/static/css', express.static(path.join(__dirname, 'build/static/css'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/css');
  }
}));

// Serve other static files
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, filePath) => {
    // Set appropriate content types for common file types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('ERROR: Build directory not found!');
  console.error('Please run "npm run build" to create the build directory.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CSS files will be served with correct MIME type: text/css`);
  console.log(`Access your application at: http://localhost:${PORT}`);
});