// ✅ Essential Node.js modules
const fs = require('fs');
const path = require('path');

// ✅ Service imports
const qlooService = require('../services/qlooService');

// ✅ Utility imports
const logger = require('../utils/logger');
const dataManager = require('../utils/dataManager');
const errorFormatter = require('../utils/errorFormatter');

class EntityController {
  // ✅ Entity details functionality
  async getEntityDetails(req, res) {
    const startTime = Date.now();
    logger.info('Entity details request initiated', { query: req.query });

    const { entity_id, location } = req.query;
    
    if (!entity_id || !location) {
      logger.error('Missing required parameters for entity details', { entity_id, location });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing entity_id or location' 
      });
    }

    const [latStr, lonStr] = location.split(',').map(s => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    
    if (isNaN(lat) || isNaN(lon)) {
      logger.error('Invalid lat/lon format', { location, lat, lon });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid lat/lon format in location' 
      });
    }

    try {
      logger.info('Calling Qloo entity details service', { entity_id, lat, lon });
      const entities = await qlooService.getEntityDetails({ entity_id, lat, lon });
      
      dataManager.saveApiResponse('entity_details', entities, { entity_id, lat, lon });

      const responseData = { success: true, results: { entities } };
      
      logger.info('Entity details request completed', { 
        duration: Date.now() - startTime,
        entitiesCount: entities.length
      });

      res.json(responseData);
    } catch (error) {
      logger.error('Entity details request failed', { error: error.message, stack: error.stack });
      res.status(500).json(errorFormatter.formatError('Failed to fetch entity details', error));
    }
  }

  // ✅ Compare entities functionality
  async compareEntities(req, res) {
    const startTime = Date.now();
    logger.info('Compare entities request initiated', { query: req.query });

    const { entity_id_a: entityA, entity_id_b: entityB } = req.query;
    
    if (!entityA || !entityB) {
      logger.error('Missing required parameters for entity comparison', { entityA, entityB });
      return res.status(400).json({ 
        success: false, 
        message: 'Both entity_id_a and entity_id_b are required' 
      });
    }

    try {
      logger.info('Calling Qloo compare entities service', { entityA, entityB });
      const comparisonData = await qlooService.compareEntities({ entityA, entityB });
      
      // Save raw comparison data
      dataManager.saveApiResponse('compare_entities', comparisonData, { entityA, entityB });

      // Process and enhance the comparison data
      let processedResults = [];
      
      if (comparisonData && comparisonData.tags && Array.isArray(comparisonData.tags)) {
        processedResults = comparisonData.tags.map(tag => ({
          name: tag.name,
          type: tag.type,
          subtype: tag.subtype,
          popularity: tag.popularity || 0,
          score: tag.query?.score || 0,
          entity_id: tag.entity_id
        }));
      }

      // Calculate comparison statistics
      const totalTags = processedResults.length;
      const avgScore = totalTags > 0 ? 
        processedResults.reduce((sum, item) => sum + item.score, 0) / totalTags : 0;
      const highScoreCount = processedResults.filter(item => item.score > 0.7).length;
      
      // Group by categories
      const categories = processedResults.reduce((acc, item) => {
        const category = item.subtype?.split(':')[2] || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Enhanced response with detailed analysis
      const enhancedResponse = {
        results: processedResults,
        comparison_summary: {
          tags_found: totalTags,
          average_score: avgScore,
          high_score_count: highScoreCount,
          comparison_quality: avgScore > 0.7 ? 'Excellent' : avgScore > 0.5 ? 'Good' : avgScore > 0.3 ? 'Fair' : 'Poor',
          has_meaningful_comparison: totalTags > 0,
          categories: Object.keys(categories).length,
          category_distribution: categories,
          top_similarities: processedResults
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => ({
              name: item.name,
              score: item.score,
              popularity: item.popularity,
              category: item.subtype?.split(':')[2] || 'other'
            }))
        },
        entities: {
          entity_a: { id: entityA },
          entity_b: { id: entityB }
        },
        metadata: {
          request_time: new Date().toISOString(),
          processing_time_ms: Date.now() - startTime
        }
      };

      logger.info('Compare entities request completed', { 
        duration: Date.now() - startTime,
        comparisonCount: totalTags,
        averageScore: avgScore,
        qualityRating: enhancedResponse.comparison_summary.comparison_quality
      });

      res.json(enhancedResponse);
    } catch (error) {
      logger.error('Compare entities request failed', { error: error.message, stack: error.stack });
      res.status(500).json(errorFormatter.formatError('Failed to compare entities', error));
    }
  }
}

module.exports = new EntityController();
