const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve the temporary landing page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'temp-index.html'));
});

// Serve the standalone CashBack page
app.get('/cashback', (req, res) => {
  res.sendFile(path.join(__dirname, 'cashback-standalone.html'));
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Simple server running at http://localhost:${PORT}`);
  console.log(`Serving temporary landing page`);
});