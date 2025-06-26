const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  
  // Allow specific origins
  const allowedOrigins = [
    'https://cashheros-d2376.web.app',
    'https://cashheros-d2376.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin || allowedOrigins[0]);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Test routes
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'CashHeros API Test' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: 'firebase-functions-test'
  });
});

app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;