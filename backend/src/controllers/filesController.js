// ✅ Essential Node.js modules
const fs = require('fs');
const path = require('path');

// ✅ Service imports
const pdfService = require('../services/pdfService');
const summaryService = require('../services/summaryService');

// ✅ Utility imports
const logger = require('../utils/logger');
const errorFormatter = require('../utils/errorFormatter');

class FilesController {
  async generateComparisonPDF(req, res) {
    const startTime = Date.now();
    logger.info('PDF generation request initiated', { body: req.body });

    try {
      const { comparisonData, summary } = req.body;

      if (!comparisonData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Comparison data is required' 
        });
      }

      logger.info('Generating comparison PDF', { 
        resultsCount: comparisonData.results?.length || 0,
        hasSummary: !!summary
      });

      const pdfResult = await pdfService.generateComparisonPDF(comparisonData, summary);
      
      logger.info('PDF generation completed', { 
        duration: Date.now() - startTime,
        filename: pdfResult.filename
      });

      // ✅ Save metadata tracking
      try {
        const metadataFile = path.join(__dirname, '../data/pdfs/metadata.json');
        let allMetadata = [];

        // Read existing metadata
        try {
          const data = await fs.promises.readFile(metadataFile, 'utf8');
          allMetadata = JSON.parse(data);
        } catch (error) {
          // File doesn't exist, start fresh
          logger.info('Creating new metadata file', { metadataFile });
        }

        // Add new entry
        allMetadata.push({
          filename: pdfResult.filename,
          type: 'comparison',
          metadata: {
            generation_time: Date.now() - startTime,
            has_summary: !!summary,
            results_count: comparisonData.results?.length || 0
          },
          timestamp: new Date().toISOString(),
          filepath: pdfResult.filepath,
          fileSize: fs.existsSync(pdfResult.filepath) ? fs.statSync(pdfResult.filepath).size : 0
        });

        // Ensure directory exists and save
        await fs.promises.mkdir(path.dirname(metadataFile), { recursive: true });
        await fs.promises.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));
        
        logger.info('PDF metadata saved successfully', { 
          filename: pdfResult.filename,
          totalPdfs: allMetadata.length 
        });

      } catch (metadataError) {
        // Don't fail the main operation if metadata saving fails
        logger.warn('Failed to save PDF metadata', { 
          error: metadataError.message,
          filename: pdfResult.filename 
        });
      }

      res.json({ 
        success: true, 
        filename: pdfResult.filename,
        downloadUrl: `/api/download-pdf/${pdfResult.filename}`,
        metadata: {
          generation_time: Date.now() - startTime,
          file_path: pdfResult.filepath,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('PDF generation failed', { 
        error: error.message, 
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      res.status(500).json(errorFormatter.formatError('Failed to generate PDF', error));
    }
  }

  // ✅ PDF download functionality
  async downloadPDF(req, res) {
    const startTime = Date.now();
    
    try {
      const { filename } = req.params;
      
      if (!/^comparison_\d+\.pdf$/.test(filename)) {
        logger.warn('Invalid filename attempted', { filename });
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid filename format' 
        });
      }

      const filepath = path.join(__dirname, '../data/pdfs', filename);

      if (!fs.existsSync(filepath)) {
        logger.warn('PDF file not found', { filename, filepath });
        return res.status(404).json({ 
          success: false, 
          error: 'PDF file not found' 
        });
      }

      logger.info('PDF download requested', { filename, filepath });

      const stats = fs.statSync(filepath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const fileStream = fs.createReadStream(filepath);
      
      fileStream.on('error', (error) => {
        logger.error('File stream error during PDF download', { 
          filename, 
          error: error.message 
        });
        
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            error: 'Failed to read PDF file' 
          });
        }
      });

      fileStream.on('end', () => {
        logger.info('PDF download completed successfully', { 
          filename,
          duration: Date.now() - startTime,
          fileSize: stats.size
        });
      });

      fileStream.pipe(res);

    } catch (error) {
      logger.error('PDF download failed', { 
        error: error.message, 
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'Failed to download PDF' 
        });
      }
    }
  }

  // ✅ **UPDATED**: Get generated PDFs list with enhanced handling
  async getGeneratedPdfs(req, res) {
    const startTime = Date.now();
    logger.info('Get generated PDFs request initiated');

    try {
      const pdfsDir = path.join(__dirname, '../data/pdfs');
      const metadataFile = path.join(pdfsDir, 'metadata.json');

      // ✅ Ensure directory exists
      await fs.promises.mkdir(pdfsDir, { recursive: true });

      let allMetadata = [];
      try {
        const data = await fs.promises.readFile(metadataFile, 'utf8');
        allMetadata = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, return empty array
        logger.info('No metadata file found, returning empty list');
      }

      // ✅ Filter valid entries and sort by timestamp
      const validMetadata = allMetadata
        .filter(item => item && item.filename && item.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // ✅ Add download URLs with enhanced metadata
      const pdfsWithUrls = validMetadata.map(item => ({
        ...item,
        downloadUrl: `/api/generated-pdfs/${item.filename}`,
        fileType: 'pdf',
        // ✅ Enhanced metadata for Files page
        title: item.metadata?.title || item.filename.replace(/\.[^/.]+$/, ""),
        description: item.metadata?.description || 'Generated PDF report',
        pageCount: item.metadata?.totalPages || 'Multiple'
      }));

      logger.info('Generated PDFs retrieved successfully', { 
        count: pdfsWithUrls.length,
        duration: Date.now() - startTime 
      });

      res.json({ 
        success: true, 
        pdfs: pdfsWithUrls,
        count: pdfsWithUrls.length 
      });

    } catch (error) {
      logger.error('Failed to get generated PDFs', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve generated PDFs' 
      });
    }
  }

  // ✅ **NEW METHOD**: Serve individual PDF files
  async serveGeneratedPdf(req, res) {
    try {
      const { filename } = req.params
      
      // ✅ Security: validate filename
      if (!filename || !filename.endsWith('.pdf')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid filename format' 
        })
      }

      const filepath = path.join(__dirname, '../data/pdfs', filename)

      // ✅ Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ 
          success: false, 
          error: 'PDF file not found' 
        })
      }

      // ✅ Set appropriate headers for PDF
      const stats = fs.statSync(filepath)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
      res.setHeader('Content-Length', stats.size)
      
      // ✅ Stream the file
      const fileStream = fs.createReadStream(filepath)
      fileStream.pipe(res)

      logger.info('PDF served successfully', { filename })

    } catch (error) {
      logger.error('Error serving PDF file:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to serve PDF file'
      })
    }
  }

  // ✅ **UPDATED**: Delete PDF with enhanced validation
  async deletePdf(req, res) {
    const startTime = Date.now();
    logger.info('Delete PDF request initiated', { params: req.params });

    try {
      const { filename } = req.params;
      
      // ✅ Updated validation for new filename format
      if (!filename || !filename.endsWith('.pdf')) {
        logger.warn('Invalid filename attempted for deletion', { filename });
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid filename format' 
        });
      }

      const filepath = path.join(__dirname, '../data/pdfs', filename);

      // ✅ Check if file exists
      if (!fs.existsSync(filepath)) {
        logger.warn('PDF file not found for deletion', { filename, filepath });
        return res.status(404).json({ 
          success: false, 
          error: 'PDF file not found' 
        });
      }

      // ✅ Delete the file
      await fs.promises.unlink(filepath);

      // ✅ Update metadata file
      try {
        const metadataFile = path.join(__dirname, '../data/pdfs', 'metadata.json');
        const data = await fs.promises.readFile(metadataFile, 'utf8');
        let allMetadata = JSON.parse(data);
        allMetadata = allMetadata.filter(item => item.filename !== filename);
        await fs.promises.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));
      } catch (metadataError) {
        // Continue even if metadata update fails
        logger.warn('Failed to update metadata after deletion', { error: metadataError.message });
      }
      
      logger.info('PDF deleted successfully', { 
        filename, 
        duration: Date.now() - startTime 
      });

      res.json({ 
        success: true, 
        message: 'PDF deleted successfully',
        filename 
      });

    } catch (error) {
      logger.error('Failed to delete PDF', { 
        error: error.message, 
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete PDF file' 
      });
    }
  }

  // ✅ Enhanced image capture and storage functionality
  async saveChartImage(req, res) {
    const startTime = Date.now();
    logger.info('Chart image save request initiated', { body: req.body });

    try {
      const { imageBase64, chartType, chartId, metadata } = req.body;

      if (!imageBase64 || !chartType || !chartId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required data: imageBase64, chartType, chartId' 
        });
      }

      // ✅ Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      // ✅ File size validation
      const maxFileSize = 10 * 1024 * 1024; // 10MB limit
      const fileSize = Buffer.byteLength(base64Data, 'base64');

      if (fileSize > maxFileSize) {
        return res.status(400).json({ 
          success: false, 
          error: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB` 
        });
      }
      
      // ✅ Create unique filename with timestamp
      const timestamp = Date.now();
      // ✅ Sanitize inputs to prevent any potential issues
      const sanitizeString = (str) => str.replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `${sanitizeString(chartType)}_${sanitizeString(chartId)}_${timestamp}.png`;

      const imagesDir = path.join(__dirname, '../data/chart-images');
      const filepath = path.join(imagesDir, filename);

      // ✅ Ensure directory exists
      await fs.promises.mkdir(imagesDir, { recursive: true });

      // ✅ Save image file
      await fs.promises.writeFile(filepath, base64Data, 'base64');

      // ✅ Save metadata to JSON file for tracking
      const metadataFile = path.join(imagesDir, 'metadata.json');
      let allMetadata = [];
      
      try {
        const existingData = await fs.promises.readFile(metadataFile, 'utf8');
        allMetadata = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet, start with empty array
      }

      allMetadata.push({
        filename,
        chartType,
        chartId,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
        filepath,
        fileSize: Buffer.byteLength(base64Data, 'base64')
      });

      await fs.promises.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));

      logger.info('Chart image saved successfully', { 
        filename, 
        chartType, 
        fileSize: Buffer.byteLength(base64Data, 'base64'),
        duration: Date.now() - startTime 
      });

      res.json({ 
        success: true, 
        filename,
        downloadUrl: `/api/chart-images/${filename}`,
        metadata: {
          chartType,
          timestamp: new Date().toISOString(),
          fileSize: Buffer.byteLength(base64Data, 'base64')
        }
      });

    } catch (error) {
      logger.error('Failed to save chart image', { 
        error: error.message, 
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save chart image' 
      });
    }
  }

  // ✅ Get list of saved chart images
  async getChartImages(req, res) {
    const startTime = Date.now();
    logger.info('Get chart images request initiated');

    try {
      const imagesDir = path.join(__dirname, '../data/chart-images');
      const metadataFile = path.join(imagesDir, 'metadata.json');

      let allMetadata = [];
      try {
        const data = await fs.promises.readFile(metadataFile, 'utf8');
        allMetadata = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, return empty array
      }

      // ✅ Sort by timestamp (newest first)
      allMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // ✅ Add download URLs
      const imagesWithUrls = allMetadata.map(item => ({
        ...item,
        downloadUrl: `/api/chart-images/${item.filename}`,
        thumbnailUrl: `/api/chart-images/${item.filename}` // Could add thumbnail generation later
      }));

      logger.info('Chart images retrieved successfully', { 
        count: imagesWithUrls.length,
        duration: Date.now() - startTime 
      });

      res.json({ 
        success: true, 
        images: imagesWithUrls,
        count: imagesWithUrls.length 
      });

    } catch (error) {
      logger.error('Failed to get chart images', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve chart images' 
      });
    }
  }

  // ✅ Serve chart image files
  async serveChartImage(req, res) {
    try {
      const { filename } = req.params;
      
      // ✅ Security: validate filename
      if (!/^[a-zA-Z0-9_-]+\.png$/.test(filename)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid filename format' 
        });
      }

      const filepath = path.join(__dirname, '../data/chart-images', filename);

      // ✅ Check if file exists
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ 
          success: false, 
          error: 'Image not found' 
        });
      }

      // ✅ Set appropriate headers
      const stats = fs.statSync(filepath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // ✅ Stream the file
      const stream = fs.createReadStream(filepath);
      stream.pipe(res);
      
    } catch (error) {
      logger.error('Failed to serve chart image', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Failed to serve image' 
      });
    }
  }

  // ✅ Delete chart image
  async deleteChartImage(req, res) {
    try {
      const { filename } = req.params;
      
      if (!/^[a-zA-Z0-9_-]+\.png$/.test(filename)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid filename format' 
        });
      }

      const imagesDir = path.join(__dirname, '../data/chart-images');
      const filepath = path.join(imagesDir, filename);
      const metadataFile = path.join(imagesDir, 'metadata.json');

      // ✅ Delete file
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
      }

      // ✅ Update metadata
      try {
        const data = await fs.promises.readFile(metadataFile, 'utf8');
        let allMetadata = JSON.parse(data);
        allMetadata = allMetadata.filter(item => item.filename !== filename);
        await fs.promises.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));
      } catch (error) {
        // Metadata file doesn't exist or is corrupted, continue anyway
      }

      res.json({ success: true, message: 'Image deleted successfully' });
      
    } catch (error) {
      logger.error('Failed to delete chart image', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete image' 
      });
    }
  }
  // ✅ **ADD THIS METHOD** to your filesController.js
async serveGeneratedPdf(req, res) {
  try {
    const { filename } = req.params
    
    logger.info('Serving PDF request', { filename })
    
    // ✅ Security: validate filename
    if (!filename || !filename.endsWith('.pdf')) {
      logger.warn('Invalid PDF filename requested', { filename })
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename format' 
      })
    }

    const filepath = path.join(__dirname, '../data/pdfs', filename)
    
    logger.info('Looking for PDF file', { filepath, exists: fs.existsSync(filepath) })

    // ✅ Check if file exists
    if (!fs.existsSync(filepath)) {
      logger.error('PDF file not found', { 
        filename, 
        filepath,
        dirExists: fs.existsSync(path.dirname(filepath))
      })
      return res.status(404).json({ 
        success: false, 
        error: 'PDF file not found',
        debug: {
          filename,
          filepath,
          dirExists: fs.existsSync(path.dirname(filepath))
        }
      })
    }

    // ✅ Set appropriate headers for PDF
    const stats = fs.statSync(filepath)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Content-Length', stats.size)
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    
    // ✅ Stream the file
    const fileStream = fs.createReadStream(filepath)
    
    fileStream.on('error', (error) => {
      logger.error('Error streaming PDF file', { filename, error: error.message })
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Failed to stream PDF' })
      }
    })
    
    fileStream.pipe(res)
    
    logger.info('PDF served successfully', { filename, fileSize: stats.size })

  } catch (error) {
    logger.error('Error serving PDF file:', { 
      error: error.message, 
      stack: error.stack,
      filename: req.params.filename 
    })
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to serve PDF file'
      })
    }
  }
}

// ✅ **NEW METHOD**: Handle comparison PDF with embedded data
async generateComparisonPDF(req, res) {
  const startTime = Date.now();
  logger.info('Comparison PDF generation request initiated', { body: req.body });

  try {
    const { comparisonData, summary, pdfData, entityA, entityB, metadata } = req.body;

    if (!comparisonData && !pdfData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comparison data or PDF data is required' 
      });
    }

    let pdfResult;

    if (pdfData) {
      // ✅ Handle pre-generated PDF data from frontend
      const filename = `comparison_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../data/pdfs', filename);

      // ✅ Ensure directory exists
      await fs.promises.mkdir(path.dirname(filepath), { recursive: true });

      // ✅ Save PDF from base64 data
      const pdfBuffer = Buffer.from(pdfData, 'base64');
      await fs.promises.writeFile(filepath, pdfBuffer);

      pdfResult = { filename, filepath };
      
      logger.info('PDF saved from frontend data', { 
        filename, 
        fileSize: pdfBuffer.length 
      });

    } else {
      // ✅ Generate PDF using existing pdfService (fallback)
      pdfResult = await pdfService.generateComparisonPDF(comparisonData, summary);
    }
    
    logger.info('PDF generation completed', { 
      duration: Date.now() - startTime,
      filename: pdfResult.filename
    });

    // ✅ Save enhanced metadata for Files page
    try {
      const metadataFile = path.join(__dirname, '../data/pdfs/metadata.json');
      let allMetadata = [];

      // Read existing metadata
      try {
        const data = await fs.promises.readFile(metadataFile, 'utf8');
        allMetadata = JSON.parse(data);
      } catch (error) {
        logger.info('Creating new metadata file', { metadataFile });
      }

      // ✅ Get file stats
      const stats = fs.existsSync(pdfResult.filepath) ? 
        fs.statSync(pdfResult.filepath) : { size: 0 };

      // Add new entry with enhanced metadata
      allMetadata.push({
        filename: pdfResult.filename,
        type: 'comparison',
        metadata: {
          title: metadata?.title || `Comparison Report - ${new Date().toLocaleDateString()}`,
          description: metadata?.description || 'Entity comparison analysis report',
          entities: metadata?.entities || { entityA: 'Unknown', entityB: 'Unknown' },
          totalSimilarities: metadata?.totalSimilarities || comparisonData?.results?.length || 0,
          generation_time: Date.now() - startTime,
          has_summary: !!summary,
          results_count: comparisonData?.results?.length || 0,
          reportType: metadata?.reportType || 'comparison',
          totalPages: 'Multiple',
          generatedAt: metadata?.generatedAt || new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        filepath: pdfResult.filepath,
        fileSize: stats.size
      });

      // Sort by timestamp (newest first)
      allMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      await fs.promises.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));
      
      logger.info('PDF metadata saved successfully', { 
        filename: pdfResult.filename,
        totalPdfs: allMetadata.length 
      });

    } catch (metadataError) {
      logger.warn('Failed to save PDF metadata', { 
        error: metadataError.message,
        filename: pdfResult.filename 
      });
    }

    res.json({ 
      success: true, 
      filename: pdfResult.filename,
      downloadUrl: `/api/generated-pdfs/${pdfResult.filename}`,
      metadata: {
        title: metadata?.title || 'Comparison Report',
        generation_time: Date.now() - startTime,
        file_path: pdfResult.filepath,
        timestamp: new Date().toISOString(),
        entities: metadata?.entities
      }
    });

  } catch (error) {
    logger.error('Comparison PDF generation failed', { 
      error: error.message, 
      stack: error.stack,
      duration: Date.now() - startTime
    });
    
    res.status(500).json(errorFormatter.formatError('Failed to generate comparison PDF', error));
  }
}

}

module.exports = new FilesController();
