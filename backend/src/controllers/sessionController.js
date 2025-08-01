const sessionCleanupService = require('../services/sessionCleanupService');
const logger = require('../utils/logger');

class SessionController {
  // ✅ Clean all session data
  async cleanSessionData(req, res) {
    const startTime = Date.now();
    logger.info('Session cleanup request initiated');

    try {
      const result = await sessionCleanupService.cleanAllSessionData();
      
      logger.info('Session cleanup request completed', {
        duration: Date.now() - startTime,
        success: result.success,
        totalDeleted: result.totalDeleted
      });

      res.json({
        success: result.success,
        message: `Session cleaned successfully! Deleted ${result.totalDeleted} files.`,
        details: result.details,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Session cleanup failed', {
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime
      });

      res.status(500).json({
        success: false,
        error: 'Failed to clean session data',
        message: error.message
      });
    }
  }

  // ✅ Get session statistics
  async getSessionStats(req, res) {
    try {
      const stats = await sessionCleanupService.getSessionStats();
      
      if (stats) {
        res.json({
          success: true,
          stats,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get session statistics'
        });
      }

    } catch (error) {
      logger.error('Session stats request failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get session statistics'
      });
    }
  }

  // ✅ Clean only PDFs
  async cleanPDFs(req, res) {
    try {
      const result = await sessionCleanupService.cleanPDFs();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ✅ Clean only images
  async cleanImages(req, res) {
    try {
      const result = await sessionCleanupService.cleanImages();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SessionController();
