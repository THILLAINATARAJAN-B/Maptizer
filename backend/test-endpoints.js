const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🚀 Testing ALL Backend Endpoints...\n');

  let searchEntityIds = [];

  // Test Health Check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test Search (and collect entity IDs for comparison)
  try {
    const search = await axios.post(`${BASE_URL}/api/search`, {
      query: 'coffee shop',
      lat: 11.016845,
      long: 76.955833,
      radius: 25,
      take: 10 // Get more entities for comparison
    });
    
    searchEntityIds = search.data.items?.map(item => item.entity_id).filter(Boolean) || [];
    console.log('✅ Search:', `Found ${search.data.items?.length || 0} items`);
    console.log('📋 Entity IDs collected:', searchEntityIds.slice(0, 3)); // Show first 3
  } catch (error) {
    console.log('❌ Search failed:', error.response?.data || error.message);
  }

  // Test Heatmap
  try {
    const heatmap = await axios.get(`${BASE_URL}/api/heatmap`, {
      params: {
        location: 'Coimbatore',
        age: '25_to_29',
        income: 'high'
      }
    });
    console.log('✅ Heatmap:', `Found ${heatmap.data.heatmap?.length || 0} points`);
  } catch (error) {
    console.log('❌ Heatmap failed:', error.response?.data || error.message);
  }

  // Test Entity Details
  if (searchEntityIds.length > 0) {
    try {
      const entityDetails = await axios.get(`${BASE_URL}/api/entity-details`, {
        params: {
          entity_id: searchEntityIds[0],
          location: '11.016845,76.955833'
        }
      });
      console.log('✅ Entity Details:', `Found ${entityDetails.data.results?.entities?.length || 0} entities`);
    } catch (error) {
      console.log('❌ Entity Details failed:', error.response?.data || error.message);
    }
  }

  // Test Compare Entities (with better entity selection)
  if (searchEntityIds.length >= 2) {
    try {
      const compareEntities = await axios.get(`${BASE_URL}/api/compare-entities`, {
        params: {
          entity_id_a: searchEntityIds[0],
          entity_id_b: searchEntityIds[1]
        }
      });
      
      const results = compareEntities.data.results;
      let comparisonInfo = '';
      
      if (Array.isArray(results)) {
        comparisonInfo = `Found ${results.length} comparisons`;
      } else if (results && results.comparison_summary) {
        comparisonInfo = `Quality: ${results.comparison_summary.comparison_quality}, Tags: ${results.comparison_summary.tags_found}`;
      } else {
        comparisonInfo = 'Received structured comparison data';
      }
      
      console.log('✅ Compare Entities:', comparisonInfo);
    } catch (error) {
      console.log('❌ Compare Entities failed:', error.response?.data || error.message);
    }
  } else {
    console.log('⚠️ Compare Entities skipped: Need at least 2 entity IDs from search');
  }

  // Test different entity combinations
  const knownEntityIds = [
    '063733E1-F955-47C7-81E5-97F7D732E888',
    '015A7609-87C5-42C8-A891-89D871602F9B',
    'F97A3147-6DE3-4F5B-8515-29AA931F3956',
    'E04E8F63-D7BC-421A-8F2B-851F2BAA1961'
  ];

  // Test alternative entity comparison
  try {
    const altCompare = await axios.get(`${BASE_URL}/api/compare-entities`, {
      params: {
        entity_id_a: knownEntityIds[0],
        entity_id_b: knownEntityIds[2] // Different combination
      }
    });
    
    console.log('✅ Alternative Compare:', `Different entity pair tested`);
  } catch (error) {
    console.log('❌ Alternative Compare failed:', error.response?.data || error.message);
  }

  // Continue with other tests...
  // Test Artist Insights
  try {
    const artistInsights = await axios.get(`${BASE_URL}/api/artist-insights`, {
      params: {
        location: 'Coimbatore',
        age: '25_to_29',
        take: 10
      }
    });
    console.log('✅ Artist Insights:', `Found ${artistInsights.data.artists?.length || 0} artists`);
  } catch (error) {
    console.log('❌ Artist Insights failed:', error.response?.data || error.message);
  }

  // Test Movie Insights
  try {
    const movieInsights = await axios.get(`${BASE_URL}/api/movie-insights`, {
      params: {
        location: 'Coimbatore',
        ratingMin: 3.5,
        take: 10
      }
    });
    console.log('✅ Movie Insights:', `Found ${movieInsights.data.movies?.length || 0} movies`);
  } catch (error) {
    console.log('❌ Movie Insights failed:', error.response?.data || error.message);
  }

  // Test Book Insights
  try {
    const bookInsights = await axios.get(`${BASE_URL}/api/book-insights`, {
      params: {
        location: 'Coimbatore',
        publication_year_min: 2020,
        take: 10
      }
    });
    console.log('✅ Book Insights:', `Found ${bookInsights.data.results?.entities?.length || 0} books`);
  } catch (error) {
    console.log('❌ Book Insights failed:', error.response?.data || error.message);
  }

  // Test Summary Generation
  try {
    const mockTags = [
      {
        name: "coffee",
        query: {
          a: { affinity: 0.85 },
          b: { affinity: 0.72 },
          delta: 0.13
        }
      },
      {
        name: "casual dining",
        query: {
          a: { affinity: 0.78 },
          b: { affinity: 0.91 },
          delta: -0.13
        }
      }
    ];

    const summary = await axios.post(`${BASE_URL}/api/summary`, {
      tags: mockTags
    });
    console.log('✅ Summary Generation:', 'Success - Generated AI summary');
  } catch (error) {
    console.log('❌ Summary Generation failed:', error.response?.data || error.message);
  }

  // Test Combined Data
  try {
    const combined = await axios.post(`${BASE_URL}/api/qloo-combined`, {
      location: 'Coimbatore',
      radius: 10,
      age: '25_to_29',
      income: 'high',
      take: 15
    });
    const totalResults = 
      (combined.data.popularity?.length || 0) +
      (combined.data.userLocation?.length || 0) +
      (combined.data.demographics?.length || 0);
    console.log('✅ Combined Data:', `Success - Total ${totalResults} results`);
  } catch (error) {
    console.log('❌ Combined Data failed:', error.response?.data || error.message);
  }

  console.log('\n🎯 Complete endpoint testing finished!');
  console.log('📊 Check your server logs for detailed request/response information');
  console.log('📁 Check src/data/session/ for saved API response files');
}

testEndpoints();
