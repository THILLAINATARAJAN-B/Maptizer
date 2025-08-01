const logger = require('./logger');

function formatError(message, error) {
  const errorDetails = {
    error: message,
    details: error.response?.data || error.message,
    timestamp: new Date().toISOString()
  };
  
  logger.error('Error formatted', { 
    message, 
    originalError: error.message,
    statusCode: error.response?.status 
  });
  
  return errorDetails;
}

module.exports = { formatError };
