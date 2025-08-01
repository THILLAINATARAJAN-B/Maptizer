const axios = require('axios');

const BASE_URL = 'https://hackathon.api.qloo.com';
const INSIGHTS_URL = `${BASE_URL}/v2/insights`;
const SEARCH_URL = `${BASE_URL}/search`;
const COMPARE_URL = `${BASE_URL}/v2/insights/compare`;

const getHeaders = () => ({
  'X-Api-Key': process.env.QLOO_API_KEY,
  'accept': 'application/json',
});

// ✅ Add delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function searchPlaces({ query, lat, long, radius, page = 1, take = 20, popularity = 0.5 }) {
  try {
    const response = await axios.get(SEARCH_URL, {
      headers: getHeaders(),
      params: {
        query,
        types: 'urn:entity:place',
        'filter.location': `${lat},${long}`,
        'filter.radius': radius,
        'filter.popularity': popularity,
        page,
        take,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Qloo Search API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      params: { query, lat, long, radius, popularity, page, take }
    });
    throw error;
  }
}

async function getDemographics(entity_id) {
  // ✅ Add delay to prevent rate limiting
  await delay(100);
  
  try {
    const response = await axios.get(INSIGHTS_URL, {
      headers: getHeaders(),
      params: {
        'filter.type': 'urn:demographics',
        'signal.interests.entities': entity_id,
      },
      timeout: 10000
    });
    return response.data.results?.demographics?.[0] || null;
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`Rate limited for entity ${entity_id}, retrying after delay...`);
      await delay(2000);
      // Retry once
      try {
        const retryResponse = await axios.get(INSIGHTS_URL, {
          headers: getHeaders(),
          params: {
            'filter.type': 'urn:demographics',
            'signal.interests.entities': entity_id,
          },
          timeout: 10000
        });
        return retryResponse.data.results?.demographics?.[0] || null;
      } catch (retryError) {
        console.error(`Failed to get demographics for ${entity_id} after retry:`, retryError.message);
        return null;
      }
    }
    throw error;
  }
}

// ✅ Fix heatmap function - use proper location name instead of coordinates
async function getHeatmap({ location, age, income }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      headers: getHeaders(),
      params: {
        'filter.type': 'urn:heatmap',
        'filter.location.query': location, // Use location name, not coordinates
        'signal.demographics.age': age,
        'signal.demographics.income': income,
      },
    });
    return response.data.results?.heatmap || [];
  } catch (error) {
    console.error('Qloo Heatmap API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      params: { location, age, income }
    });
    throw error;
  }
}

async function getHeatmapByLocation({ wktPoint, radius, income, age }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      headers: getHeaders(),
      params: {
        'filter.type': 'urn:heatmap',
        'filter.location': wktPoint,
        'filter.radius': radius,
        'signal.demographics.income': income,
        'signal.demographics.age': age,
      },
    });
    return response.data.results?.heatmap || [];
  } catch (error) {
    console.error('Qloo Heatmap by Location API Error:', error.response?.data);
    throw error;
  }
}

async function getEntityDetails({ entity_id, lat, lon }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      headers: getHeaders(),
      params: {
        'filter.type': 'urn:entity:place',
        'signal.interests.entities': entity_id,
        'filter.location.lat': lat,
        'filter.location.lon': lon,
      },
    });
    return response.data.results?.entities || [];
  } catch (error) {
    console.error('Qloo Entity Details API Error:', error.response?.data);
    throw error;
  }
}

async function compareEntities({ entityA, entityB }) {
  try {
    const response = await axios.get(COMPARE_URL, {
      headers: getHeaders(),
      params: {
        'a.signal.interests.entities': entityA,
        'b.signal.interests.entities': entityB,
        model: 'predictive',
        page: 1,
        take: 15,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Qloo Compare API Error:', error.response?.data);
    throw error;
  }
}

// ✅ Fix artist insights - use location name instead of coordinates
async function getArtistInsights({ location, age, take }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      params: {
        'filter.type': 'urn:entity:artist',
        'signal.location.query': location, // Use location name
        'signal.demographics.age': age,
        take,
      },
      headers: { 'x-api-key': process.env.QLOO_API_KEY },
    });
    return response.data.results?.entities || [];
  } catch (error) {
    console.error('Qloo Artist Insights API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      params: { location, age, take }
    });
    throw error;
  }
}

async function getMovieInsights({ location, ratingMin, take }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      headers: {
        'x-api-key': process.env.QLOO_API_KEY,
        'accept': 'application/json',
      },
      params: {
        'filter.type': 'urn:entity:movie',
        'signal.location.query': location, // Use location name
        'filter.rating.min': ratingMin,
        take,
        'feature.explainability': true,
      },
    });
    return response.data.results?.entities || [];
  } catch (error) {
    console.error('Qloo Movie Insights API Error:', error.response?.data);
    throw error;
  }
}

async function getBookInsights({ location, publicationYearMin, take }) {
  try {
    const response = await axios.get(INSIGHTS_URL, {
      params: {
        'filter.type': 'urn:entity:book',
        'signal.location.query': location, // Use location name
        'filter.publication_year.min': publicationYearMin,
        take,
        'feature.explainability': true,
      },
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.QLOO_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Qloo Book Insights API Error:', error.response?.data);
    throw error;
  }
}

module.exports = {
  searchPlaces,
  getDemographics,
  getHeatmap,
  getHeatmapByLocation,
  getEntityDetails,
  compareEntities,
  getArtistInsights,
  getMovieInsights,
  getBookInsights
};
