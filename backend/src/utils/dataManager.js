const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class DataManager {
  constructor() {
    this.sessionDir = path.join(__dirname, '../data/session');
    this.apiResponsesDir = path.join(this.sessionDir, 'api_responses');
    this.logsDir = path.join(this.sessionDir, 'logs');
    this.demographicsFile = path.join(this.sessionDir, 'demographics.json');
    this.sessionId = Date.now().toString();
  }

  initializeSession() {
    try {
      // Clean previous session data
      this.cleanSessionData();
      
      // Create new session directories in the correct order
      fs.mkdirSync(this.sessionDir, { recursive: true });
      fs.mkdirSync(this.apiResponsesDir, { recursive: true });
      fs.mkdirSync(this.logsDir, { recursive: true }); // Create logs directory
      
      // Initialize demographics file
      fs.writeFileSync(this.demographicsFile, '{}');
      
      // Now it's safe to log since directories exist
      logger.info('Session initialized', { 
        sessionId: this.sessionId,
        sessionDir: this.sessionDir 
      });
    } catch (error) {
      console.error('Failed to initialize session:', error.message);
    }
  }

  cleanSessionData() {
    try {
      if (fs.existsSync(this.sessionDir)) {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
        console.log('Session data cleaned'); // Use console.log instead of logger here
      }
    } catch (error) {
      console.error('Failed to clean session data:', error.message);
    }
  }

  saveApiResponse(endpoint, data, metadata = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${endpoint}_${timestamp}.json`;
      const filepath = path.join(this.apiResponsesDir, filename);
      
      const responseData = {
        endpoint,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        metadata,
        data
      };
      
      fs.writeFileSync(filepath, JSON.stringify(responseData, null, 2));
      
      logger.info('API response saved', { 
        endpoint, 
        filename, 
        dataSize: JSON.stringify(data).length 
      });
    } catch (error) {
      logger.error('Failed to save API response', { 
        endpoint, 
        error: error.message 
      });
    }
  }

  saveDemographics(entity_id, data) {
    try {
      let demographics = {};
      if (fs.existsSync(this.demographicsFile)) {
        demographics = JSON.parse(fs.readFileSync(this.demographicsFile, 'utf8'));
      }
      
      demographics[entity_id] = {
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      };
      
      fs.writeFileSync(this.demographicsFile, JSON.stringify(demographics, null, 2));
      
      logger.info('Demographics saved', { entity_id });
    } catch (error) {
      logger.error('Failed to save demographics', { 
        entity_id, 
        error: error.message 
      });
    }
  }

  getCachedDemographics(entity_id) {
    try {
      if (fs.existsSync(this.demographicsFile)) {
        const demographics = JSON.parse(fs.readFileSync(this.demographicsFile, 'utf8'));
        const cached = demographics[entity_id];
        
        if (cached) {
          logger.info('Demographics retrieved from cache', { entity_id });
          return cached.data;
        }
      }
      return null;
    } catch (error) {
      logger.error('Failed to get cached demographics', { 
        entity_id, 
        error: error.message 
      });
      return null;
    }
  }

  getSessionStats() {
    try {
      const stats = {
        sessionId: this.sessionId,
        apiResponsesCount: 0,
        demographicsCount: 0,
        totalDataSize: 0
      };

      if (fs.existsSync(this.apiResponsesDir)) {
        const files = fs.readdirSync(this.apiResponsesDir);
        stats.apiResponsesCount = files.length;
        
        files.forEach(file => {
          const filepath = path.join(this.apiResponsesDir, file);
          const stat = fs.statSync(filepath);
          stats.totalDataSize += stat.size;
        });
      }

      if (fs.existsSync(this.demographicsFile)) {
        const demographics = JSON.parse(fs.readFileSync(this.demographicsFile, 'utf8'));
        stats.demographicsCount = Object.keys(demographics).length;
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get session stats', { error: error.message });
      return null;
    }
  }
}

module.exports = new DataManager();
