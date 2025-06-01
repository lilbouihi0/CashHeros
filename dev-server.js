const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = 3001;

// Check if the React server is running
function checkReactServer() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Log all requests for debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Special handling for CSS files - intercept before proxy
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    console.log(`[CSS Interceptor] Setting Content-Type for: ${req.url}`);
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Direct handling for specific CSS files that might be problematic
app.get('/static/css/*.css', (req, res, next) => {
  console.log(`[Direct CSS Handler] Processing: ${req.url}`);
  
  // Try to fetch the CSS directly from the React server
  http.get(`http://localhost:3000${req.url}`, (reactRes) => {
    let cssData = '';
    
    reactRes.on('data', (chunk) => {
      cssData += chunk;
    });
    
    reactRes.on('end', () => {
      res.setHeader('Content-Type', 'text/css');
      res.send(cssData);
    });
  }).on('error', (err) => {
    console.error(`[Error] Failed to fetch CSS directly: ${err.message}`);
    next(); // Continue to proxy if direct fetch fails
  });
});

// Create a more robust proxy with better error handling
const proxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/static/css/': '/static/css/' // Ensure CSS paths are preserved
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests for debugging
    console.log(`[Proxy Request] ${req.method} ${req.url} -> ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Always set the correct MIME type for CSS files
    if (req.url.endsWith('.css')) {
      console.log(`[Proxy Response] Setting MIME type for: ${req.url}`);
      proxyRes.headers['content-type'] = 'text/css';
    }
    
    // Log response status for debugging
    console.log(`[Proxy Response] ${req.url} - Status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] ${err.message} for ${req.url}`);
    
    // Provide a helpful error page
    res.writeHead(500, {
      'Content-Type': 'text/html'
    });
    
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Proxy Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .error-container { max-width: 800px; margin: 0 auto; background: #f8f8f8; padding: 20px; border-radius: 5px; border-left: 5px solid #e74c3c; }
            h1 { color: #e74c3c; }
            .solutions { background: #eaf7ea; padding: 15px; border-radius: 5px; margin-top: 20px; }
            code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>Proxy Error</h1>
            <p><strong>Error message:</strong> ${err.message}</p>
            <p><strong>URL:</strong> ${req.url}</p>
            
            <div class="solutions">
              <h2>Possible Solutions:</h2>
              <ol>
                <li>Make sure the React development server is running on port 3000</li>
                <li>Try running <code>npm start</code> in a new terminal window</li>
                <li>Check for any error messages in the React server console</li>
                <li>Restart both servers by running <code>npm run start:css-fix</code></li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Use the proxy middleware for all requests
app.use('/', proxy);

// Start the server
async function startServer() {
  const isReactServerRunning = await checkReactServer();
  
  if (!isReactServerRunning) {
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: React development server does not appear to be running on port 3000.');
    console.warn('\x1b[33m%s\x1b[0m', 'Make sure to start it with "npm start" before using this proxy.');
    console.log('');
  }
  
  app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', '===================================================');
    console.log('\x1b[32m%s\x1b[0m', `CSS Fix Proxy Server running at http://localhost:${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', '===================================================');
    console.log('');
    console.log(`Proxying requests to: http://localhost:3000`);
    console.log(`CSS files will be served with correct MIME type: text/css`);
    console.log('');
    console.log('\x1b[36m%s\x1b[0m', 'Access your application at:');
    console.log('\x1b[36m%s\x1b[0m', `http://localhost:${PORT}`);
    console.log('');
  });
}

startServer();