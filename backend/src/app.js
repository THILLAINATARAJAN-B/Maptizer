const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logger = require('./utils/logger');
const dataManager = require('./utils/dataManager');
const fs = require('fs');
const path = require('path');

// Ensure required directories exist
const requiredDirs = [
  path.join(__dirname, 'data/pdfs'),
  path.join(__dirname, 'data/chart-images')
];

requiredDirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

const app = express();

app.use(cors());

// ✅ FIXED: Proper middleware setup with 50MB limit for JSON
app.use(express.json({ 
  limit: '50mb',           // Allow up to 50MB JSON payloads
  parameterLimit: 50000    // Increase parameter limit
}));
app.use(express.urlencoded({ 
  limit: '50mb',           // Allow up to 50MB URL-encoded payloads
  extended: true,
  parameterLimit: 50000
}));

// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    body: req.body, 
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

// Initialize session data directory
dataManager.initializeSession();

app.use('/api', apiRoutes);
app.use('/', healthRoutes);

// Clean up session data on server shutdown
process.on('SIGINT', () => {
  logger.info('Server shutting down, cleaning session data...');
  dataManager.cleanSessionData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Server terminating, cleaning session data...');
  dataManager.cleanSessionData();
  process.exit(0);
});

module.exports = app;
