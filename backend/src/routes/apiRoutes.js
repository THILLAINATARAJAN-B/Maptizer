const express = require('express');
const router = express.Router();

// ✅ Import separated controllers
const searchController = require('../controllers/searchController');
const heatmapController = require('../controllers/heatmapController');
const entityController = require('../controllers/entityController');
const insightsController = require('../controllers/insightsController');
const filesController = require('../controllers/filesController');
const pdfController = require('../controllers/pdfController');

// ✅ NEW: Import session controller
const sessionController = require('../controllers/sessionController');

const logger = require('../utils/logger');

// ✅ Search routes
router.post('/search', searchController.search.bind(searchController));
router.post('/qloo-combined', searchController.getCombinedData.bind(searchController));

// ✅ Heatmap routes
router.get('/heatmap', heatmapController.getHeatmap.bind(heatmapController));

// ✅ Entity routes
router.get('/entity-details', entityController.getEntityDetails.bind(entityController));
router.get('/compare-entities', entityController.compareEntities.bind(entityController));

// ✅ Insights routes
router.get('/artist-insights', insightsController.getArtistInsights.bind(insightsController));
router.get('/movie-insights', insightsController.getMovieInsights.bind(insightsController));
router.get('/book-insights', insightsController.getBookInsights.bind(insightsController));

// ✅ Summary routes
router.post('/summary', insightsController.generateSummary.bind(insightsController));

// ✅ PDF routes (for Compare page - using existing pdfService)
router.post('/generate-pdf', filesController.generateComparisonPDF.bind(filesController));
router.get('/download-pdf/:filename', filesController.downloadPDF.bind(filesController));
router.get('/test-groq', insightsController.testGroqConnection.bind(insightsController));

// ✅ Chart image routes
router.post('/save-chart-image', filesController.saveChartImage.bind(filesController));
router.get('/chart-images', filesController.getChartImages.bind(filesController));
router.get('/chart-images/:filename', filesController.serveChartImage.bind(filesController));
router.delete('/chart-images/:filename', filesController.deleteChartImage.bind(filesController));

// ✅ Combined PDF routes (for Files page)
router.post('/generate-combined-pdf', pdfController.generateCombinedPDF.bind(pdfController));
router.get('/generated-pdfs', filesController.getGeneratedPdfs.bind(filesController));
router.get('/generated-pdfs/:filename', filesController.serveGeneratedPdf.bind(filesController));
router.delete('/generated-pdfs/:filename', filesController.deletePdf.bind(filesController));

// ✅ NEW: Session cleanup routes
router.post('/session/clean', sessionController.cleanSessionData.bind(sessionController));
router.get('/session/stats', sessionController.getSessionStats.bind(sessionController));
router.post('/session/clean-pdfs', sessionController.cleanPDFs.bind(sessionController));
router.post('/session/clean-images', sessionController.cleanImages.bind(sessionController));

module.exports = router;
