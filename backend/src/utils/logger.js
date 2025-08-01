const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../data/session/logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      // If directory creation fails, we'll just log to console
      console.error('Failed to create log directory:', error.message);
    }
  }

  formatMessage(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      pid: process.pid
    };
  }

  writeLog(level, message, data = {}) {
    const logMessage = this.formatMessage(level, message, data);
    
    // Console output with colors
    const colors = {
      INFO: '\x1b[36m',
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      DEBUG: '\x1b[35m'
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${logMessage.timestamp}] ${level}: ${message}${reset}`);
    if (Object.keys(data).length > 0) {
      console.log(`${color}Data:${reset}`, JSON.stringify(data, null, 2));
    }

    // File output - ensure directory exists before writing
    try {
      // Re-ensure log directory exists before each write
      this.ensureLogDir();
      
      const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
      const logLine = JSON.stringify(logMessage) + '\n';
      
      // Check if directory exists before writing
      if (fs.existsSync(this.logDir)) {
        fs.appendFileSync(logFile, logLine);
      } else {
        // If directory still doesn't exist, create it and try again
        fs.mkdirSync(this.logDir, { recursive: true });
        fs.appendFileSync(logFile, logLine);
      }
    } catch (error) {
      // Don't fail the application if logging fails, just log to console
      console.error('Failed to write log file:', error.message);
    }
  }

  info(message, data = {}) {
    this.writeLog('INFO', message, data);
  }

  error(message, data = {}) {
    this.writeLog('ERROR', message, data);
  }

  warn(message, data = {}) {
    this.writeLog('WARN', message, data);
  }

  debug(message, data = {}) {
    this.writeLog('DEBUG', message, data);
  }
}

module.exports = new Logger();
