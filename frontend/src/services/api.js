// ✅ Fixed: Use import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ Response handler utility
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, keep the HTTP status message
      console.warn('Failed to parse error response:', parseError);
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// ✅ Request utility with timeout and error handling
const makeRequest = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
};

// ✅ Complete API Service Object
const apiService = {
  // 🔍 Search Operations
  searchPlaces: (data) => {
    return makeRequest('/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 🗺️ Map & Location Operations
  getHeatmap: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/heatmap?${queryString}`, {
      method: 'GET',
    });
  },

  getEntityDetails: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/entity-details?${queryString}`, {
      method: 'GET',
    });
  },

  getCombinedData: (data) => {
    return makeRequest('/qloo-combined', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 🔄 Comparison Operations
  compareEntities: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/compare-entities?${queryString}`, {
      method: 'GET',
    });
  },

  // 🤖 AI & Summary Operations
  generateSummary: (data) => {
    return makeRequest('/summary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 📊 Insights Operations
  getArtistInsights: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/artist-insights?${queryString}`, {
      method: 'GET',
    });
  },

  getMovieInsights: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/movie-insights?${queryString}`, {
      method: 'GET',
    });
  },

  getBookInsights: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/book-insights?${queryString}`, {
      method: 'GET',
    });
  },

  // 📄 PDF Operations
  generatePDF: (data) => {
    return makeRequest('/generate-pdf', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  downloadPDF: async (filename) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for download
    
    try {
      const response = await fetch(`${API_BASE_URL}/download-pdf/${filename}`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Download timeout - please try again');
      }
      
      throw error;
    }
  },

  // 🔧 Utility Operations
  healthCheck: () => {
    return makeRequest('/health', {
      method: 'GET',
    });
  },

  // 📍 Location Utilities
  geocodeLocation: (address) => {
    return makeRequest('/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },

  reverseGeocode: (lat, lng) => {
    return makeRequest('/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    });
  },

  // ✅ Test API connection
  testConnection: () => {
    return makeRequest('/test-groq', {
      method: 'GET',
    });
  },
};

// ✅ Enhanced API service with retry logic
const apiServiceWithRetry = {
  ...apiService,
  
  // Retry wrapper for critical operations
  withRetry: async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`API attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const waitTime = delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
  },
};

// ✅ API service with batch operations
const batchApiService = {
  ...apiServiceWithRetry,
  
  // Batch search multiple locations
  batchSearch: async (searches) => {
    const promises = searches.map(search => 
      apiService.searchPlaces(search).catch(error => ({ error: error.message }))
    );
    
    return Promise.all(promises);
  },
  
  // Batch entity details
  batchEntityDetails: async (entityRequests) => {
    const promises = entityRequests.map(request => 
      apiService.getEntityDetails(request).catch(error => ({ error: error.message }))
    );
    
    return Promise.all(promises);
  },
  
  // Batch insights
  batchInsights: async (type, requests) => {
    const insightMethod = {
      artists: apiService.getArtistInsights,
      movies: apiService.getMovieInsights,
      books: apiService.getBookInsights,
    }[type];
    
    if (!insightMethod) {
      throw new Error(`Invalid insight type: ${type}`);
    }
    
    const promises = requests.map(request => 
      insightMethod(request).catch(error => ({ error: error.message }))
    );
    
    return Promise.all(promises);
  },
};

// ✅ Environment-specific configuration (Fixed for Vite)
const getApiConfig = () => {
  const isDevelopment = import.meta.env.DEV; // Vite's way to check development mode
  
  return {
    baseURL: isDevelopment 
      ? 'http://localhost:5000/api' 
      : import.meta.env.VITE_API_URL || '/api',
    timeout: isDevelopment ? 30000 : 15000,
    retries: isDevelopment ? 1 : 3,
    mapTilesUrl: import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };
};

// ✅ API service with configuration
const configuredApiService = {
  ...batchApiService,
  config: getApiConfig(),
  
  // Update base URL if needed
  updateConfig: (newConfig) => {
    Object.assign(configuredApiService.config, newConfig);
  },

  // ✅ Get current configuration
  getConfig: () => configuredApiService.config,

  // ✅ Debug helper
  debug: () => {
    console.log('API Configuration:', {
      baseURL: API_BASE_URL,
      config: configuredApiService.config,
      environment: import.meta.env.DEV ? 'development' : 'production'
    });
  }
};

// ✅ Export the complete API service
export { 
  apiService,
  apiServiceWithRetry,
  batchApiService,
  configuredApiService,
  handleResponse,
  makeRequest
};

// ✅ Default export for backward compatibility
export default configuredApiService;
