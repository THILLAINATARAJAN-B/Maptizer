// ✅ Essential Node.js modules
const fs = require('fs');
const path = require('path');

// ✅ Service imports
const qlooService = require('../services/qlooService');
const summaryService = require('../services/summaryService');

// ✅ Utility imports
const logger = require('../utils/logger');
const dataManager = require('../utils/dataManager');
const errorFormatter = require('../utils/errorFormatter');

class InsightsController {
  // ✅ Artist insights functionality
  async getArtistInsights(req, res) {
    const startTime = Date.now();
    logger.info('Artist insights request initiated', { query: req.query });

    const { location, age, take = 25 } = req.query;

    try {
      logger.info('Calling Qloo artist insights service', { location, age, take });
      const artists = await qlooService.getArtistInsights({ location, age, take });
      
      dataManager.saveApiResponse('artist_insights', artists, { location, age, take });

      logger.info('Artist insights request completed', { 
        duration: Date.now() - startTime,
        artistsCount: artists.length
      });

      res.json({ artists });
    } catch (error) {
      logger.error('Artist insights request failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'API request failed' });
    }
  }

  // ✅ Movie insights functionality
  async getMovieInsights(req, res) {
    const startTime = Date.now();
    logger.info('Movie insights request initiated', { query: req.query });

    const { location, ratingMin = 3.5, take = 35 } = req.query;
    
    if (!location) {
      logger.error('Missing location parameter for movie insights');
      return res.status(400).json({ error: 'Location is required' });
    }

    try {
      logger.info('Calling Qloo movie insights service', { location, ratingMin, take });
      const movies = await qlooService.getMovieInsights({ location, ratingMin, take });
      
      dataManager.saveApiResponse('movie_insights', movies, { location, ratingMin, take });

      logger.info('Movie insights request completed', { 
        duration: Date.now() - startTime,
        moviesCount: movies.length
      });

      res.json({ movies });
    } catch (error) {
      logger.error('Movie insights request failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Failed to fetch movie insights' });
    }
  }

  // ✅ Book insights functionality
  async getBookInsights(req, res) {
    const startTime = Date.now();
    logger.info('Book insights request initiated', { query: req.query });

    const location = req.query.location || 'Coimbatore';
    const publicationYearMin = Number(req.query.publication_year_min) || 2018;
    const take = Number(req.query.take) || 30;

    try {
      logger.info('Calling Qloo book insights service', { location, publicationYearMin, take });
      const response = await qlooService.getBookInsights({ location, publicationYearMin, take });
      
      dataManager.saveApiResponse('book_insights', response, { location, publicationYearMin, take });

      logger.info('Book insights request completed', { 
        duration: Date.now() - startTime,
        booksCount: response.results?.entities?.length || 0
      });

      res.json(response);
    } catch (error) {
      logger.error('Book insights request failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Failed to fetch book insights' });
    }
  }

  // ✅ Generate summary functionality
  async generateSummary(req, res) {
    const startTime = Date.now();
    logger.info('Generate summary request initiated', { body: req.body });

    const { tags } = req.body;

    if (!tags) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tags data is required for summary generation' 
      });
    }

    try {
      logger.info('Calling GROQ summary service', { tagsCount: tags?.length });
      const summary = await summaryService.generateSummary(tags);
      
      dataManager.saveApiResponse('summary', { summary, tags }, { tagsCount: tags?.length });

      logger.info('Generate summary request completed', { 
        duration: Date.now() - startTime,
        summaryLength: summary?.length,
        provider: 'GROQ'
      });

      res.json({ 
        success: true, 
        summary,
        metadata: {
          provider: 'GROQ (Llama)',
          model: 'llama3-8b-8192',
          generation_time: Date.now() - startTime,
          tag_count: Array.isArray(tags) ? tags.length : 0
        }
      });
    } catch (error) {
      logger.error('Generate summary request failed', { error: error.message, stack: error.stack });
      res.status(500).json(errorFormatter.formatError('Failed to generate summary', error));
    }
  }

  // ✅ Test GROQ connection
  async testGroqConnection(req, res) {
    const startTime = Date.now();
    logger.info('Testing GROQ API connection');

    try {
      const result = await summaryService.testConnection();
      
      logger.info('GROQ connection test completed', { 
        duration: Date.now() - startTime,
        success: result.success 
      });

      if (result.success) {
        res.json({ 
          success: true, 
          message: 'GROQ API connection successful',
          response: result.message,
          apiInfo: summaryService.getApiInfo(),
          availableModels: summaryService.getAvailableModels()
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'GROQ API connection failed',
          error: result.error,
          details: result.details
        });
      }
    } catch (error) {
      logger.error('GROQ connection test failed', { error: error.message });
      res.status(500).json({ 
        success: false, 
        message: 'Failed to test GROQ connection',
        error: error.message 
      });
    }
  }
}

module.exports = new InsightsController();
