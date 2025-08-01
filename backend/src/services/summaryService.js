const axios = require('axios');
const logger = require('../utils/logger');

class SummaryService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama3-8b-8192'; // Fast and reliable model
  }

  async generateSummary(tags) {
    try {
      // ✅ Enhanced validation
      if (!tags || !Array.isArray(tags)) {
        logger.warn('Invalid tags provided for summary generation', { tags });
        return 'No valid comparison data available to generate summary.';
      }

      if (tags.length === 0) {
        return 'No similarities found between the selected entities.';
      }

      // ✅ Check API key
      if (!this.apiKey) {
        logger.error('GROQ API key not found');
        return this.generateFallbackSummary(tags);
      }

      // ✅ Process tags based on your data structure
      const processedTags = this.formatTagsForAnalysis(tags);
      
      if (processedTags.length === 0) {
        return 'Unable to extract meaningful data from the comparison results.';
      }

      // ✅ Create enhanced prompt for business analysis
      const prompt = this.createAnalysisPrompt(processedTags);

      logger.info('Generating AI summary with GROQ', { 
        tagCount: processedTags.length,
        model: this.model
      });

      // ✅ Call GROQ API
      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert business analyst specializing in location intelligence and competitive analysis. Provide clear, actionable insights based on data comparisons.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const summary = response.data.choices[0]?.message?.content || 'Unable to generate summary at this time.';
      
      logger.info('Summary generated successfully with GROQ', { 
        summaryLength: summary.length,
        tokensUsed: response.data.usage?.total_tokens || 'unknown'
      });

      return summary.trim();

    } catch (error) {
      logger.error('Failed to generate summary with GROQ', { 
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Return fallback summary
      return this.generateFallbackSummary(tags);
    }
  }

  // ✅ Format tags for analysis based on your data structure
  formatTagsForAnalysis(tags) {
    return tags
      .filter(tag => tag && tag.name) // Filter out invalid tags
      .map(tag => {
        // Handle different tag structures
        const category = tag.subtype?.split(':')[2] || 'unknown';
        const score = tag.score || tag.query?.score || 0;
        const popularity = tag.popularity || 0;
        
        // Handle different query structures
        let affinityA = 0, affinityB = 0, delta = 0;
        
        if (tag.query) {
          if (tag.query.a && tag.query.b) {
            // Your example structure
            affinityA = tag.query.a.affinity || 0;
            affinityB = tag.query.b.affinity || 0;
            delta = tag.query.delta || 0;
          } else if (tag.query.score) {
            // Alternative structure
            affinityA = tag.query.score;
            affinityB = tag.query.score;
            delta = 0;
          }
        }
        
        return {
          name: tag.name,
          category: category.replace('_', ' '),
          score: (score * 100).toFixed(1),
          popularity: (popularity * 100).toFixed(1),
          affinityA: affinityA.toFixed(3),
          affinityB: affinityB.toFixed(3),
          delta: delta.toFixed(3),
          entityId: tag.entity_id || 'unknown'
        };
      })
      .slice(0, 15); // Limit to top 15 for better analysis
  }

  // ✅ Create comprehensive analysis prompt
  createAnalysisPrompt(processedTags) {
    const formattedText = processedTags.map((tag, index) =>
      `${index + 1}. Tag: "${tag.name}" | Category: ${tag.category} | Match Score: ${tag.score}% | Popularity: ${tag.popularity}% | Affinity A: ${tag.affinityA} | Affinity B: ${tag.affinityB} | Delta: ${tag.delta}`
    ).join('\n');

    return `
You are analyzing a comparison between two business locations (Entity A vs Entity B) based on their similarity tags and affinities.

COMPARISON DATA:
${formattedText}

ANALYSIS REQUIREMENTS:
Please provide a comprehensive business intelligence summary that includes:

1. **Overall Similarity Assessment**: Rate the overall similarity between the two entities
2. **Key Commonalities**: Identify the strongest shared characteristics (high match scores)
3. **Distinctive Differences**: Highlight areas where the entities diverge (high delta values)
4. **Category Analysis**: Group similarities by business categories (dining, amenities, services, etc.)
5. **Strategic Insights**: What do these similarities suggest about:
   - Target market alignment
   - Competitive positioning
   - Business model similarities
   - Customer experience overlap
6. **Actionable Recommendations**: Suggest 2-3 strategic actions based on this analysis

FORMAT: Please structure your response with clear sections and bullet points for easy reading. Aim for 250-350 words.

IMPORTANT: Focus on business value and actionable insights rather than just listing the data.
`;
  }

  // ✅ Enhanced fallback summary
  generateFallbackSummary(tags) {
    try {
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return 'No comparison data available to generate summary.';
      }

      const validTags = tags.filter(tag => tag && tag.name);
      if (validTags.length === 0) {
        return 'Unable to process comparison data for summary generation.';
      }

      // Group by categories
      const categories = {};
      validTags.forEach(tag => {
        const category = tag.subtype?.split(':')[2] || 'other';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(tag);
      });

      const topCategories = Object.entries(categories)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 4);

      const avgScore = validTags.reduce((sum, tag) => sum + (tag.score || 0), 0) / validTags.length;
      const highScoreCount = validTags.filter(tag => (tag.score || 0) > 0.7).length;

      return `
**🏢 Business Location Comparison Analysis**

**📊 Executive Summary:**
Analysis reveals ${validTags.length} significant similarity points between the two locations, indicating ${avgScore > 0.6 ? 'strong strategic alignment' : avgScore > 0.4 ? 'moderate business overlap' : 'limited but notable similarities'}.

**🎯 Key Performance Indicators:**
• Overall Match Score: ${(avgScore * 100).toFixed(1)}%
• High-Confidence Matches: ${highScoreCount} attributes (>70% similarity)
• Quality Assessment: ${highScoreCount > 5 ? '⭐ Excellent' : highScoreCount > 2 ? '✅ Good' : '⚠️ Fair'}

**🏷️ Primary Similarity Categories:**
${topCategories.map(([category, items]) => 
  `• **${category.replace('_', ' ').toUpperCase()}**: ${items.length} shared attributes`
).join('\n')}

**🔝 Top Strategic Matches:**
${validTags
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, 5)
  .map((tag, i) => `${i + 1}. **${tag.name}** - ${((tag.score || 0) * 100).toFixed(1)}% match`)
  .join('\n')}

**💡 Business Intelligence Insights:**
${avgScore > 0.6 
  ? 'These locations demonstrate exceptional operational similarity, indicating they serve comparable markets and could benefit from shared strategies or competitive analysis.'
  : avgScore > 0.4
  ? 'Moderate similarity suggests overlapping customer bases with distinct positioning opportunities.'
  : 'Limited overlap indicates unique market positioning with specific areas of convergence worth exploring.'
}

**📈 Strategic Recommendations:**
${avgScore > 0.6 
  ? '• Leverage shared strengths for competitive advantage\n• Consider partnership or collaboration opportunities\n• Apply successful strategies across both locations'
  : '• Focus on highest-scoring similarities for strategic insights\n• Explore differentiation opportunities in unique areas\n• Monitor competitive positioning in shared categories'
}
      `.trim();

    } catch (error) {
      logger.error('Failed to generate fallback summary', { error: error.message });
      return 'Unable to generate summary due to data processing issues. Please try again later.';
    }
  }

  // ✅ Test GROQ API connection
  async testConnection() {
    try {
      if (!this.apiKey) {
        throw new Error('GROQ API key not configured');
      }

      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Hello! Please respond with "GROQ API connection successful" to confirm the connection is working.'
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      const message = response.data.choices[0]?.message?.content || 'Connection established';
      
      logger.info('GROQ API connection test successful', { response: message });
      return { 
        success: true, 
        message,
        model: this.model,
        usage: response.data.usage
      };
    } catch (error) {
      logger.error('GROQ API connection test failed', { 
        error: error.message,
        response: error.response?.data
      });
      return { 
        success: false, 
        error: error.message,
        details: error.response?.data
      };
    }
  }

  async generateFileSummary(data) {
  try {
    if (!this.apiKey) {
      return this.generateFallbackFileSummary(data);
    }

    const prompt = `
You are analyzing a collection of analytics files for a business intelligence report.

FILES INCLUDED:
- Images: ${data.images?.length || 0} chart visualizations
- PDFs: ${data.pdfs?.length || 0} detailed reports  
- Total Files: ${data.totalFiles || 0}

Please provide a comprehensive summary that includes:
1. **Report Overview**: What this collection represents
2. **Key Insights**: Main findings from the analytics
3. **Data Quality**: Assessment of the information completeness
4. **Business Value**: How this data can drive decisions
5. **Recommendations**: 2-3 actionable next steps

Keep the summary between 200-300 words, professional yet accessible.
    `;

    const response = await axios.post(
      this.baseURL,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence analyst specializing in data summarization and insights generation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    return response.data.choices[0]?.message?.content || this.generateFallbackFileSummary(data);

  } catch (error) {
    logger.error('File summary generation failed', { error: error.message });
    return this.generateFallbackFileSummary(data);
  }
}

generateFallbackFileSummary(data) {
  return `
**📊 Analytics Collection Summary**

This report consolidates ${data.totalFiles || 0} analytics files including ${data.images?.length || 0} chart visualizations and ${data.pdfs?.length || 0} detailed reports.

**🎯 Key Insights:**
• Comprehensive location intelligence data captured
• Multiple visualization formats for different analytical perspectives  
• Combined data provides 360-degree business view
• Ready for executive presentation and decision-making

**💡 Business Value:**
This collection represents a complete analytical snapshot that can drive strategic business decisions, identify market opportunities, and optimize operational efficiency.

**📈 Recommended Actions:**
1. Review chart patterns for trend identification
2. Cross-reference findings across different data sources
3. Schedule stakeholder presentation to discuss insights
  `.trim();
}


  // ✅ Get API information
  getApiInfo() {
    return {
      provider: 'GROQ',
      model: this.model,
      baseURL: this.baseURL,
      features: ['Fast Inference', 'Llama Models', 'Free Tier'],
      limits: {
        note: 'Check GROQ documentation for current limits',
        model_info: 'llama3-8b-8192 - 8B parameters, 8192 context length'
      },
      benefits: [
        'Completely Free',
        'Very Fast Response Times',
        'High Quality Output',
        'No Rate Limiting (generous free tier)'
      ]
    };
  }

  // ✅ Alternative models available on GROQ
  getAvailableModels() {
    return [
      'llama3-8b-8192',      // Current default - fast and reliable
      'llama3-70b-8192',     // More powerful but slower
      'mixtral-8x7b-32768',  // Good balance of speed and quality
      'gemma-7b-it'          // Google's Gemma model
    ];
  }

  // ✅ Switch model if needed
  setModel(modelName) {
    const availableModels = this.getAvailableModels();
    if (availableModels.includes(modelName)) {
      this.model = modelName;
      logger.info('GROQ model updated', { newModel: modelName });
      return true;
    } else {
      logger.warn('Invalid model name', { requested: modelName, available: availableModels });
      return false;
    }
  }
}

module.exports = new SummaryService();
