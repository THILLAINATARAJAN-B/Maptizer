const app = require('./src/app');
const logger = require('./src/utils/logger');
const dataManager = require('./src/utils/dataManager');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info('🚀 Backend server started', { 
    port: PORT,
    url: `http://localhost:${PORT}`,
    sessionId: dataManager.sessionId
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    dataManager.cleanSessionData();
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
