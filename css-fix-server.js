const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = 3000;

// Enable compression for better performance
app.use(compression());

// Log all requests for debugging with color
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\x1b[90m[${timestamp}]\x1b[0m \x1b[36m${req.method}\x1b[0m ${req.url}`);
  next();
});

// Special handling for CSS files - apply to all CSS requests
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    console.log(`\x1b[32m[CSS Handler]\x1b[0m Setting Content-Type for: ${req.url}`);
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Explicit route for CSS files to ensure correct MIME type
app.get('*.css', (req, res, next) => {
  console.log(`\x1b[32m[CSS Direct Route]\x1b[0m Processing: ${req.url}`);
  res.setHeader('Content-Type', 'text/css');
  next();
});

// Serve static CSS files with explicit MIME type from build directory
app.use('/static/css', express.static(path.join(__dirname, 'build/static/css'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/css');
  }
}));

// Handle development mode static files
app.use('/static/css', express.static(path.join(__dirname, 'public/static/css'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/css');
  }
}));

// Serve other static files from the build directory
app.use(express.static(path.join(__dirname, 'build'), {
  index: false, // Don't serve index.html automatically
  setHeaders: (res, path) => {
    // Set appropriate content types for common file types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve static files from the public directory for development
app.use(express.static(path.join(__dirname, 'public'), {
  index: false, // Don't serve index.html automatically
  setHeaders: (res, path) => {
    // Set appropriate content types for common file types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// For all other requests, serve index.html
app.get('*', (req, res) => {
  console.log(`\x1b[33m[SPA Route]\x1b[0m Serving index.html for: ${req.url}`);
  
  // Try to serve from build first, then fall back to public
  const buildPath = path.join(__dirname, 'build', 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(buildPath)) {
    res.sendFile(buildPath);
  } else if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .error-container { max-width: 800px; margin: 0 auto; background: #f8f8f8; padding: 20px; border-radius: 5px; border-left: 5px solid #e74c3c; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Page Not Found</h1>
            <p>The requested page could not be found.</p>
            <p>Make sure you have built the application with <code>npm run build</code> or are running in development mode.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Check if build or public directory exists
function checkDirectories() {
  const buildExists = fs.existsSync(path.join(__dirname, 'build'));
  const publicExists = fs.existsSync(path.join(__dirname, 'public'));
  
  if (!buildExists && !publicExists) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Neither build nor public directory exists!');
    console.error('\x1b[31m%s\x1b[0m', 'Please run "npm run build" to create the build directory.');
    process.exit(1);
  }
  
  if (!buildExists) {
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Build directory not found. Serving from public directory only.');
    console.warn('\x1b[33m%s\x1b[0m', 'For production use, run "npm run build" first.');
  }
  
  if (!publicExists) {
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Public directory not found. Serving from build directory only.');
  }
}

// Start the server
function startServer() {
  checkDirectories();
  
  app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', '===================================================');
    console.log('\x1b[32m%s\x1b[0m', `CSS Fix Server running at http://localhost:${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', '===================================================');
    console.log('');
    console.log(`CSS files will be served with correct MIME type: text/css`);
    console.log('');
    
    if (fs.existsSync(path.join(__dirname, 'build'))) {
      console.log(`Serving from: ${path.join(__dirname, 'build')}`);
    }
    
    if (fs.existsSync(path.join(__dirname, 'public'))) {
      console.log(`Serving from: ${path.join(__dirname, 'public')}`);
    }
    
    console.log('');
    console.log('\x1b[36m%s\x1b[0m', 'Access your application at:');
    console.log('\x1b[36m%s\x1b[0m', `http://localhost:${PORT}`);
    console.log('');
  });
}

startServer();