const app = require('./server');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Auth health: http://localhost:${PORT}/api/auth/health`);
  console.log(`CSRF token: http://localhost:${PORT}/api/auth/csrf-token`);
});