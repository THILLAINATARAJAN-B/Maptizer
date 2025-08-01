const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    const pdfDir = path.join(__dirname, '../data/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
  }

  async generateCombinedPDF(options) {
  try {
    const { selectedImages, selectedPdfs, aiSummary, metadata } = options;
    
    const filename = `combined_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../data/pdfs', filename);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);

      // Add header
      this.addHeader(doc);
      
      // Add title
      doc.fontSize(24)
         .fillColor('#2563eb')
         .text('Combined Analytics Report', { align: 'center' })
         .moveDown(1);

      // Add AI summary if provided
      if (aiSummary) {
        this.addSummarySection(doc, aiSummary);
      }

      // Add image references
      if (selectedImages && selectedImages.length > 0) {
        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('Included Chart Images', { underline: true })
           .moveDown(0.5);

        selectedImages.forEach((img, index) => {
          doc.fontSize(10)
             .fillColor('#374151')
             .text(`${index + 1}. ${img.chartType} - ${img.filename}`)
             .moveDown(0.2);
        });
        doc.moveDown(1);
      }

      // Add footer and end
      this.addFooter(doc);
      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    });

  } catch (error) {
    logger.error('Combined PDF generation failed', { error: error.message });
    throw error;
  }
}


  async generateComparisonPDF(comparisonData, summary) {
    try {
      const filename = `comparison_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../data/pdfs', filename);
      
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);

        // ✅ Add all content first
        this.addHeader(doc);
        this.addTitle(doc);
        this.addMetadata(doc, comparisonData);
        
        if (summary) {
          this.addSummarySection(doc, summary);
        }

        if (comparisonData.results && comparisonData.results.length > 0) {
          this.addComparisonDetails(doc, comparisonData.results);
        }

        if (comparisonData.comparison_summary) {
          this.addStatistics(doc, comparisonData.comparison_summary);
        }

        // ✅ Add footer BEFORE ending the document
        this.addFooter(doc);

        // ✅ End the document after adding footer
        doc.end();

        stream.on('finish', () => {
          logger.info('PDF generated successfully', { filename, filepath });
          resolve({ filename, filepath });
        });

        stream.on('error', (error) => {
          logger.error('PDF generation failed', { error: error.message });
          reject(error);
        });
      });

    } catch (error) {
      logger.error('PDF service error', { error: error.message });
      throw error;
    }
  }

  addHeader(doc) {
    doc.fontSize(12)
       .fillColor('#6b7280')
       .text('LocationIQ Insights Report', 50, 50)
       .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
       .moveDown(1);
       
    // Add separator line
    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke()
       .moveDown(1);
  }

  addTitle(doc) {
    doc.fontSize(24)
       .fillColor('#2563eb')
       .text('Entity Comparison Report', { align: 'center' })
       .moveDown(1);
  }

  addMetadata(doc, comparisonData) {
    doc.fontSize(14)
       .fillColor('#374151')
       .text('Comparison Overview', { underline: true })
       .moveDown(0.5);

    const metadata = comparisonData.metadata || {};
    const summary = comparisonData.comparison_summary || {};

    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Report Generated: ${metadata.request_time || new Date().toISOString()}`)
       .text(`Processing Time: ${metadata.processing_time_ms || 'N/A'}ms`)
       .text(`Total Similarities Found: ${summary.tags_found || 0}`)
       .text(`Comparison Quality: ${summary.comparison_quality || 'Unknown'}`)
       .moveDown(1);
  }

  addSummarySection(doc, summary) {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('AI-Powered Summary', { underline: true })
       .moveDown(0.5);

    // Add summary with proper text wrapping
    doc.fontSize(11)
       .fillColor('#374151')
       .text(summary, 50, doc.y, { 
         width: 500, 
         align: 'justify',
         lineGap: 2
       })
       .moveDown(2);
  }

  addComparisonDetails(doc, results) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Detailed Similarities', { underline: true })
       .moveDown(0.5);

    // Add table header
    const startY = doc.y;
    doc.fontSize(10)
       .fillColor('#4b5563');

    // Header row background
    doc.rect(50, startY, 500, 25)
       .fillAndStroke('#f3f4f6', '#d1d5db');

    // Header text
    doc.fillColor('#1f2937')
       .text('#', 55, startY + 8)
       .text('Similarity', 80, startY + 8)
       .text('Category', 280, startY + 8)
       .text('Match Score', 380, startY + 8)
       .text('Popularity', 460, startY + 8);

    let currentY = startY + 25;

    // Data rows (limit to prevent overflow)
    const limitedResults = results.slice(0, 25);
    limitedResults.forEach((item, index) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 80;
      }

      const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      
      doc.rect(50, currentY, 500, 20)
         .fillAndStroke(rowColor, '#e5e7eb');

      doc.fontSize(9)
         .fillColor('#374151')
         .text(index + 1, 55, currentY + 6)
         .text(item.name.substring(0, 35) + (item.name.length > 35 ? '...' : ''), 80, currentY + 6)
         .text((item.subtype?.split(':')[2] || 'other').replace('_', ' '), 280, currentY + 6)
         .text(`${((item.score || 0) * 100).toFixed(1)}%`, 380, currentY + 6)
         .text(`${((item.popularity || 0) * 100).toFixed(1)}%`, 460, currentY + 6);

      currentY += 20;
    });

    if (results.length > 25) {
      doc.fontSize(9)
         .fillColor('#6b7280')
         .text(`... and ${results.length - 25} more similarities`, 50, currentY + 10);
    }

    doc.moveDown(2);
  }

  addStatistics(doc, summary) {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('Statistical Overview', { underline: true })
       .moveDown(0.5);

    const stats = [
      { label: 'Total Similarities', value: summary.tags_found || 0 },
      { label: 'High Score Matches', value: summary.high_score_count || 0 },
      { label: 'Average Score', value: `${((summary.average_score || 0) * 100).toFixed(1)}%` },
      { label: 'Categories Found', value: summary.categories || 0 },
      { label: 'Quality Rating', value: summary.comparison_quality || 'Unknown' }
    ];

    // Create stats grid
    const cols = 2;
    const colWidth = 240;
    const rowHeight = 40;

    stats.forEach((stat, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 50 + (col * colWidth);
      const y = doc.y + (row * rowHeight);

      // Stat box
      doc.rect(x, y, colWidth - 10, rowHeight - 5)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fontSize(12)
         .fillColor('#1f2937')
         .text(stat.value, x + 10, y + 8, { width: colWidth - 20, align: 'center' });

      doc.fontSize(9)
         .fillColor('#6b7280')
         .text(stat.label, x + 10, y + 22, { width: colWidth - 20, align: 'center' });
    });

    doc.y += Math.ceil(stats.length / cols) * rowHeight + 20;
  }

  // ✅ Fixed addFooter method
  addFooter(doc) {
    try {
      const pages = doc.bufferedPageRange();
      const pageCount = pages.count;
      
      // ✅ Safety check for page count
      if (pageCount === 0) {
        logger.warn('No pages found for footer addition');
        return;
      }
      
      // ✅ Iterate through valid page indices only
      for (let i = 0; i < pageCount; i++) {
        try {
          doc.switchToPage(i);
          
          // Footer line
          doc.strokeColor('#e5e7eb')
             .lineWidth(1)
             .moveTo(50, 750)
             .lineTo(550, 750)
             .stroke();

          // Footer text
          doc.fontSize(8)
             .fillColor('#9ca3af')
             .text('Generated by LocationIQ Insights Platform', 50, 760)
             .text(`Page ${i + 1} of ${pageCount}`, 50, 760, { align: 'right' });
             
        } catch (pageError) {
          logger.warn(`Failed to add footer to page ${i}`, { error: pageError.message });
          continue; // Skip this page and continue with others
        }
      }
    } catch (error) {
      logger.error('Footer addition failed', { error: error.message });
      // Don't throw error - let PDF generation continue without footer
    }
  }

  // Clean up old PDF files (optional)
  cleanupOldPDFs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const pdfDir = path.join(__dirname, '../data/pdfs');
      const files = fs.readdirSync(pdfDir);
      const now = Date.now();

      files.forEach(file => {
        const filepath = path.join(pdfDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          logger.info('Cleaned up old PDF', { filename: file });
        }
      });
    } catch (error) {
      logger.warn('PDF cleanup failed', { error: error.message });
    }
  }
}

module.exports = new PDFService();
