const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class SessionCleanupService {
  constructor() {
    this.pdfsDir = path.join(__dirname, '../data/pdfs');
    this.imagesDir = path.join(__dirname, '../data/chart-images');
  }

  // ✅ Clean all PDFs and their metadata
  async cleanPDFs() {
    try {
      await this.ensureDirectoryExists(this.pdfsDir);
      
      // Get all files in PDFs directory
      const files = await fs.readdir(this.pdfsDir);
      
      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(this.pdfsDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile() && file.endsWith('.pdf')) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.info('Deleted PDF file', { filename: file });
        }
      }

      // Reset metadata.json
      const metadataPath = path.join(this.pdfsDir, 'metadata.json');
      await fs.writeFile(metadataPath, '[]', 'utf8');
      
      logger.info('PDFs cleanup completed', { deletedCount });
      return { success: true, deletedCount, type: 'pdfs' };
      
    } catch (error) {
      logger.error('Error cleaning PDFs', { error: error.message });
      return { success: false, error: error.message, type: 'pdfs' };
    }
  }

  // ✅ Clean all images and their metadata
  async cleanImages() {
    try {
      await this.ensureDirectoryExists(this.imagesDir);
      
      // Get all files in images directory
      const files = await fs.readdir(this.imagesDir);
      
      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(this.imagesDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile() && this.isImageFile(file)) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.info('Deleted image file', { filename: file });
        }
      }

      // Reset metadata.json
      const metadataPath = path.join(this.imagesDir, 'metadata.json');
      await fs.writeFile(metadataPath, '[]', 'utf8');
      
      logger.info('Images cleanup completed', { deletedCount });
      return { success: true, deletedCount, type: 'images' };
      
    } catch (error) {
      logger.error('Error cleaning images', { error: error.message });
      return { success: false, error: error.message, type: 'images' };
    }
  }

  // ✅ Clean all session data (PDFs + Images)
  async cleanAllSessionData() {
    logger.info('Starting complete session cleanup');
    
    const results = {
      pdfs: await this.cleanPDFs(),
      images: await this.cleanImages(),
      timestamp: new Date().toISOString()
    };

    const totalDeleted = results.pdfs.deletedCount + results.images.deletedCount;
    const allSuccessful = results.pdfs.success && results.images.success;

    logger.info('Session cleanup completed', {
      totalDeleted,
      allSuccessful,
      results
    });

    return {
      success: allSuccessful,
      totalDeleted,
      details: results
    };
  }

  // ✅ Get current session data statistics
  async getSessionStats() {
    try {
      const pdfStats = await this.getDirectoryStats(this.pdfsDir, '.pdf');
      const imageStats = await this.getDirectoryStats(this.imagesDir, ['.png', '.jpg', '.jpeg', '.gif']);

      return {
        pdfs: pdfStats,
        images: imageStats,
        total: pdfStats.count + imageStats.count,
        totalSize: pdfStats.size + imageStats.size
      };
    } catch (error) {
      logger.error('Error getting session stats', { error: error.message });
      return null;
    }
  }

  // ✅ Helper methods
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      logger.info('Created directory', { dirPath });
    }
  }

  isImageFile(filename) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async getDirectoryStats(dirPath, extensions) {
    try {
      await this.ensureDirectoryExists(dirPath);
      const files = await fs.readdir(dirPath);
      
      let count = 0;
      let size = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile()) {
          const matchesExtension = Array.isArray(extensions) 
            ? extensions.some(ext => file.toLowerCase().endsWith(ext))
            : file.toLowerCase().endsWith(extensions);
            
          if (matchesExtension) {
            count++;
            size += stat.size;
          }
        }
      }
      
      return { count, size };
    } catch (error) {
      return { count: 0, size: 0 };
    }
  }
}

module.exports = new SessionCleanupService();
