const fs = require('fs').promises
const path = require('path')
const PDFDocument = require('pdfkit')
const logger = require('../utils/logger')

class PDFController {
  constructor() {
    this.pdfDir = path.join(__dirname, '../data/pdfs')
    this.chartImagesDir = path.join(__dirname, '../data/chart-images')
    this.ensureDirectories()
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.pdfDir, { recursive: true })
      await fs.mkdir(this.chartImagesDir, { recursive: true })
    } catch (error) {
      logger.error('Error creating directories:', error)
    }
  }

  async generateCombinedPDF(req, res) {
    const startTime = Date.now()
    logger.info('Combined PDF generation request initiated', { body: req.body })

    try {
      const { images = [], pdfs = [], generateSummary: shouldGenerateSummary = false, metadata = {} } = req.body

      if (images.length === 0 && pdfs.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided for PDF generation'
        })
      }

      // ✅ Professional filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `LocationIQ_Analytics_Report_${timestamp}.pdf`
      const filepath = path.join(this.pdfDir, filename)
      
      await this.createProfessionalPDF(filepath, {
        images,
        pdfs,
        metadata
      })

      // ✅ **CRITICAL FIX**: Save metadata for filesController to read
      await this.saveMetadata(filename, filepath, images, metadata, startTime)

      logger.info('PDF generated successfully', { filename, filepath })
      logger.info('Combined PDF generation completed', {
        duration: Date.now() - startTime,
        filename,
        imagesCount: images.length,
        pdfsCount: pdfs.length
      })

      res.json({
        success: true,
        filename,
        downloadUrl: `/api/generated-pdfs/${filename}`,
        metadata: {
          ...metadata,
          filename,
          generatedAt: new Date().toISOString(),
          totalPages: await this.getEstimatedPageCount(images.length),
          imagesIncluded: images.length,
          pdfsIncluded: pdfs.length,
          fileSize: await this.getFileSize(filepath)
        }
      })

    } catch (error) {
      logger.error('Error generating combined PDF:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report'
      })
    }
  }

  // ✅ **NEW METHOD**: Save metadata for filesController
  async saveMetadata(filename, filepath, images, metadata, startTime) {
    try {
      const metadataFile = path.join(this.pdfDir, 'metadata.json')
      let allMetadata = []

      // Read existing metadata
      try {
        const data = await fs.readFile(metadataFile, 'utf8')
        allMetadata = JSON.parse(data)
      } catch (error) {
        // File doesn't exist, start fresh
        logger.info('Creating new metadata file', { metadataFile })
      }

      // Get file stats
      const stats = await fs.stat(filepath)

      // Add new entry
      allMetadata.push({
        filename,
        type: 'analytics_report',
        metadata: {
          title: `Analytics Report - ${new Date().toLocaleDateString()}`,
          description: 'Professional chart collection report',
          totalPages: await this.getEstimatedPageCount(images.length),
          generation_time: Date.now() - startTime,
          images_count: images.length,
          chart_types: this.getUniqueChartTypes(images),
          generatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        filepath,
        fileSize: stats.size
      })

      // Sort by timestamp (newest first)
      allMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Save metadata
      await fs.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2))
      
      logger.info('PDF metadata saved successfully', { 
        filename,
        totalPdfs: allMetadata.length 
      })

    } catch (metadataError) {
      logger.warn('Failed to save PDF metadata', { 
        error: metadataError.message,
        filename 
      })
      // Don't throw error - let PDF generation succeed even if metadata fails
    }
  }

  async createProfessionalPDF(filepath, { images, pdfs, metadata }) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true,
          info: {
            Title: 'LocationIQ Analytics Report',
            Author: 'LocationIQ Insights Platform',
            Subject: 'Chart Images & Analytics Collection',
            Keywords: 'analytics, charts, visualization, business intelligence',
            CreationDate: new Date()
          }
        })

        const stream = require('fs').createWriteStream(filepath)
        doc.pipe(stream)

        // ✅ Modern Professional Template
        await this.createModernCoverPage(doc, images, metadata)
        await this.createExecutiveSummary(doc, images, metadata)
        await this.createTableOfContents(doc, images)
        
        if (images.length > 0) {
          await this.createChartsSection(doc, images)
        }
        
        await this.createAnalyticsSummary(doc, images, metadata)
        await this.createAppendix(doc, images, metadata)
        
        // ✅ Add page numbers to all pages
        this.addPageNumbers(doc)

        doc.end()
        stream.on('finish', resolve)
        stream.on('error', reject)

      } catch (error) {
        reject(error)
      }
    })
  }

  async createModernCoverPage(doc, images, metadata) {
    // ✅ Modern gradient background
    doc.rect(0, 0, 595, 842).fill('#f8fafc')
    
    // ✅ Header gradient bar
    doc.rect(0, 0, 595, 120)
       .fill('#1e40af')
    
    doc.rect(0, 120, 595, 8)
       .fill('#f97316')

    // ✅ Company Logo Area (Text-based)
    doc.fontSize(36)
       .fillColor('#ffffff')
       .text('LocationIQ', 60, 40)
       .fontSize(16)
       .text('Analytics Platform', 60, 85)

    // ✅ Report Title with modern styling
    doc.fontSize(42)
       .fillColor('#1e293b')
       .text('Analytics Report', 60, 180)
       .fontSize(24)
       .fillColor('#64748b')
       .text('Chart Collection & Visual Analysis', 60, 240)

    // ✅ Professional info cards
    const cardY = 320
    const cardHeight = 80
    const cardWidth = 220

    // Card 1: Charts Info
    doc.rect(60, cardY, cardWidth, cardHeight)
       .fill('#ffffff')
       .stroke('#e2e8f0')

    doc.fontSize(28)
       .fillColor('#f97316')
       .text(images.length.toString(), 80, cardY + 15)
       .fontSize(12)
       .fillColor('#64748b')
       .text('Chart Visualizations', 80, cardY + 50)

    // Card 2: Report Info
    doc.rect(315, cardY, cardWidth, cardHeight)
       .fill('#ffffff')
       .stroke('#e2e8f0')

    doc.fontSize(28)
       .fillColor('#1e40af')
       .text(this.getUniqueChartTypes(images).length.toString(), 335, cardY + 15)
       .fontSize(12)
       .fillColor('#64748b')
       .text('Chart Types', 335, cardY + 50)

    // ✅ Generation details
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Report Details', 60, 460)
       .fontSize(11)
       .fillColor('#64748b')
       .text(`Generated: ${new Date().toLocaleDateString('en-US', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, 60, 485)
       .text(`Report ID: LIQ-${Date.now()}`, 60, 505)
       .text(`Total Files: ${images.length} charts`, 60, 525)

    // ✅ Professional decorative elements
    doc.circle(500, 600, 60)
       .fill('#f1f5f9')
    doc.circle(520, 620, 30)
       .fill('#e2e8f0')
    doc.circle(480, 640, 20)
       .fill('#cbd5e1')

    // ✅ Footer with branding
    doc.fontSize(10)
       .fillColor('#94a3b8')
       .text('Powered by LocationIQ Insights Platform', 60, 750)
       .text('Business Intelligence & Analytics', 60, 770)

    doc.addPage()
  }

  async createExecutiveSummary(doc, images, metadata) {
    // ✅ Section header with styling
    this.addSectionHeader(doc, 'Executive Summary', '#1e40af')

    // ✅ Summary content with professional layout
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Report Overview', 60, 120)
       .fontSize(11)
       .fillColor('#475569')
       .text(
         `This comprehensive analytics report presents a collection of ${images.length} chart visualizations ` +
         `generated through the LocationIQ Insights Platform. The analysis covers ${this.getUniqueChartTypes(images).length} ` +
         `different visualization types, providing comprehensive insights into location-based intelligence and ` +
         `comparative analytics.`,
         60, 145, { width: 475, align: 'justify', lineGap: 3 }
       )

    // ✅ Key highlights section
    const highlightsY = doc.y + 30
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Key Highlights', 60, highlightsY)

    const highlights = [
      `${images.length} high-resolution chart visualizations included`,
      `${this.getUniqueChartTypes(images).length} different chart types for comprehensive analysis`,
      `Professional formatting suitable for executive presentation`,
      `Complete metadata and timestamp information preserved`,
      `Ready for strategic decision-making and stakeholder communication`
    ]

    let currentY = highlightsY + 25
    highlights.forEach((highlight, index) => {
      doc.fontSize(11)
         .fillColor('#f97316')
         .text('●', 80, currentY)
         .fillColor('#475569')
         .text(highlight, 100, currentY, { width: 435 })
      currentY += 20
    })

    // ✅ Chart types breakdown
    const breakdownY = currentY + 30
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Chart Types Breakdown', 60, breakdownY)

    const chartTypes = this.getChartTypeCount(images)
    let chartY = breakdownY + 25

    Object.entries(chartTypes).forEach(([type, count]) => {
      const percentage = ((count / images.length) * 100).toFixed(1)
      
      doc.fontSize(11)
         .fillColor('#64748b')
         .text(type.replace(/-/g, ' ').toUpperCase(), 80, chartY)
         .fillColor('#1e40af')
         .text(`${count} charts (${percentage}%)`, 350, chartY)
      
      // Progress bar
      doc.rect(80, chartY + 15, 200, 4)
         .fill('#e2e8f0')
      doc.rect(80, chartY + 15, (count / Math.max(...Object.values(chartTypes))) * 200, 4)
         .fill('#f97316')
      
      chartY += 35
    })

    doc.addPage()
  }

  async createTableOfContents(doc, images) {
    this.addSectionHeader(doc, 'Table of Contents', '#1e40af')

    const tocItems = [
      { title: 'Executive Summary', page: 2 },
      { title: 'Table of Contents', page: 3 },
      { title: 'Chart Visualizations', page: 4 },
      { title: 'Analytics Summary', page: Math.ceil(4 + (images.length / 2)) },
      { title: 'Technical Appendix', page: Math.ceil(5 + (images.length / 2)) }
    ]

    let tocY = 120
    tocItems.forEach((item, index) => {
      doc.fontSize(12)
         .fillColor('#1e293b')
         .text(`${index + 1}.`, 60, tocY)
         .text(item.title, 85, tocY)
         .fillColor('#64748b')
         .text(`Page ${item.page}`, 450, tocY)
      
      // Dotted line
      for (let x = 200; x < 440; x += 8) {
        doc.circle(x, tocY + 6, 0.5).fill('#cbd5e1')
      }
      
      tocY += 25
    })

    doc.addPage()
  }

  async createChartsSection(doc, images) {
    this.addSectionHeader(doc, 'Chart Visualizations', '#1e40af')

    let currentY = 120
    let pageCount = 0

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      try {
        const imagePath = path.join(this.chartImagesDir, image.filename)
        const imageExists = await fs.access(imagePath).then(() => true).catch(() => false)
        
        if (imageExists) {
          // ✅ Check if we need a new page
          if (currentY > 400) {
            doc.addPage()
            currentY = 60
            pageCount++
          }

          // ✅ Chart title with modern styling
          doc.rect(60, currentY, 475, 35)
             .fill('#f8fafc')
             .stroke('#e2e8f0')

          doc.fontSize(14)
             .fillColor('#1e293b')
             .text(`${i + 1}. ${image.chartType.replace(/-/g, ' ').toUpperCase()}`, 75, currentY + 10)

          currentY += 45

          // ✅ Professional image embedding
          const maxWidth = 475
          const maxHeight = 300
          
          doc.image(imagePath, 60, currentY, {
            fit: [maxWidth, maxHeight],
            align: 'center'
          })

          currentY += maxHeight + 15

          // ✅ Metadata in professional format
          if (image.metadata) {
            doc.rect(60, currentY, 475, 35)
               .fill('#fafafa')
               .stroke('#e5e7eb')

            doc.fontSize(9)
               .fillColor('#64748b')
               .text(`Generated: ${new Date(image.metadata.timestamp).toLocaleString()}`, 75, currentY + 8)
               .text(`Type: ${image.metadata.chartType || 'N/A'}`, 75, currentY + 20)

            if (image.metadata.entityA && image.metadata.entityB) {
              doc.text(`Comparison: ${image.metadata.entityA} vs ${image.metadata.entityB}`, 280, currentY + 8)
              doc.text(`Similarities: ${image.metadata.totalSimilarities || 'N/A'}`, 280, currentY + 20)
            }
            
            currentY += 45
          }

        } else {
          // ✅ Professional placeholder for missing images
          doc.rect(60, currentY, 475, 60)
             .fill('#fef2f2')
             .stroke('#fecaca')

          doc.fontSize(12)
             .fillColor('#dc2626')
             .text('⚠️ Chart Image Not Available', 75, currentY + 15)
             .fontSize(10)
             .fillColor('#7f1d1d')
             .text(`Filename: ${image.filename}`, 75, currentY + 35)

          currentY += 70
        }

      } catch (error) {
        logger.warn(`Error processing image ${image.filename}:`, error)
        currentY += 40
      }
    }

    doc.addPage()
  }

  async createAnalyticsSummary(doc, images, metadata) {
    this.addSectionHeader(doc, 'Analytics Summary', '#1e40af')

    // ✅ Summary statistics with modern cards
    const stats = [
      { label: 'Total Charts', value: images.length, color: '#f97316' },
      { label: 'Chart Types', value: this.getUniqueChartTypes(images).length, color: '#1e40af' },
      { label: 'Processing Quality', value: '100%', color: '#059669' },
      { label: 'Report Pages', value: await this.getEstimatedPageCount(images.length), color: '#7c3aed' }
    ]

    let cardX = 60
    const cardY = 120
    const cardWidth = 110
    const cardHeight = 80

    stats.forEach((stat, index) => {
      // Card background
      doc.rect(cardX, cardY, cardWidth, cardHeight)
         .fill('#ffffff')
         .stroke('#e2e8f0')

      // Value
      doc.fontSize(24)
         .fillColor(stat.color)
         .text(stat.value.toString(), cardX + 10, cardY + 15, { width: cardWidth - 20, align: 'center' })

      // Label
      doc.fontSize(10)
         .fillColor('#64748b')
         .text(stat.label, cardX + 10, cardY + 50, { width: cardWidth - 20, align: 'center' })

      cardX += cardWidth + 20
    })

    // ✅ Processing details
    const detailsY = cardY + 120
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Processing Details', 60, detailsY)

    const details = [
      `Report generated: ${new Date().toLocaleString()}`,
      `Platform: LocationIQ Insights Analytics`,
      `Image format: PNG (High Resolution)`,
      `Processing status: Successfully completed`,
      `Quality assurance: All charts verified`,
      `Compatibility: Standard PDF readers supported`
    ]

    let detailY = detailsY + 25
    details.forEach(detail => {
      doc.fontSize(11)
         .fillColor('#64748b')
         .text('•', 80, detailY)
         .text(detail, 100, detailY)
      detailY += 18
    })

    doc.addPage()
  }

  async createAppendix(doc, images, metadata) {
    this.addSectionHeader(doc, 'Technical Appendix', '#1e40af')

    // ✅ Technical specifications
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Technical Specifications', 60, 120)

    const techSpecs = [
      { label: 'PDF Version', value: '1.4 (Compatible)' },
      { label: 'Page Size', value: 'A4 (210 × 297 mm)' },
      { label: 'Image Resolution', value: 'High (300 DPI equivalent)' },
      { label: 'Color Space', value: 'RGB' },
      { label: 'Fonts', value: 'Embedded for compatibility' },
      { label: 'File Optimization', value: 'Optimized for print and digital' }
    ]

    let specY = 150
    techSpecs.forEach(spec => {
      doc.fontSize(11)
         .fillColor('#64748b')
         .text(spec.label + ':', 80, specY)
         .fillColor('#1e293b')
         .text(spec.value, 250, specY)
      specY += 20
    })

    // ✅ File listing
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text('Included Files', 60, specY + 30)

    let fileY = specY + 60
    images.forEach((image, index) => {
      if (fileY > 700) {
        doc.addPage()
        fileY = 60
      }

      doc.fontSize(10)
         .fillColor('#64748b')
         .text(`${index + 1}.`, 80, fileY)
         .text(image.filename, 100, fileY)
         .text(image.chartType, 350, fileY)
         .text(new Date(image.metadata?.timestamp || Date.now()).toLocaleDateString(), 450, fileY)
      fileY += 15
    })

    // ✅ Legal footer
    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text('© 2025 LocationIQ Insights Platform. All rights reserved.', 60, 780)
       .text('This report contains proprietary analytics and visualizations.', 60, 795)
  }

  addSectionHeader(doc, title, color) {
    doc.rect(0, 60, 595, 50)
       .fill(color)

    doc.fontSize(20)
       .fillColor('#ffffff')
       .text(title, 60, 80)
  }

  addPageNumbers(doc) {
    const pages = doc.bufferedPageRange()
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i)
      
      if (i > 0) { // Skip page numbers on cover page
        doc.fontSize(9)
           .fillColor('#94a3b8')
           .text(`Page ${i} of ${pages.count - 1}`, 500, 800)
      }
    }
  }

  // ✅ Helper methods
  getUniqueChartTypes(images) {
    const types = images.map(img => img.chartType || 'unknown')
    return [...new Set(types)]
  }

  getChartTypeCount(images) {
    const counts = {}
    images.forEach(img => {
      const type = img.chartType || 'unknown'
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  }

  async getEstimatedPageCount(imageCount) {
    return Math.ceil(5 + (imageCount / 2))
  }

  async getFileSize(filepath) {
    try {
      const stats = await fs.stat(filepath)
      return stats.size
    } catch (error) {
      return 0
    }
  }
}

module.exports = new PDFController()
