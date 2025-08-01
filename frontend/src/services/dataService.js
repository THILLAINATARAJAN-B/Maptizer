// ✅ Enhanced helper function to extract main category with better priority matching
export const extractMainCategory = (item) => {
  if (!item.tags || !Array.isArray(item.tags)) return 'place'
  
  // Extract categories from tags with type 'urn:tag:category'
  const categories = item.tags
    .filter(tag => tag.type === 'urn:tag:category')
    .map(tag => tag.name.toLowerCase().trim())
  
  // Extended priority categories for better classification
  const priorityCategories = [
    'restaurant', 'cafe', 'bar', 'coffee shop', 'coffee_shop', 
    'bakery', 'hotel', 'shopping', 'entertainment', 'park', 
    'museum', 'hospital', 'school', 'office', 'mall', 'spa'
  ]
  
  // Check for priority matches with fuzzy matching
  for (const priority of priorityCategories) {
    const priorityNormalized = priority.replace(/_/g, ' ')
    const found = categories.find(cat => 
      cat.includes(priorityNormalized) || 
      priorityNormalized.includes(cat) ||
      cat.split(' ').some(word => priorityNormalized.includes(word))
    )
    if (found) return priority.replace(' ', '_') // Return normalized version
  }
  
  // Fallback to first available category or 'place'
  return categories[0]?.replace(/\s+/g, '_') || 'place'
}

// ✅ Enhanced helper function for formatting labels with extended type support
export const formatLabel = (key, type) => {
  const labels = {
    age: {
      '18_to_24': '18-24',
      '18_24': '18-24',
      '25_to_29': '25-29', 
      '25_29': '25-29',
      '30_to_34': '30-34',
      '30_34': '30-34',
      '35_to_44': '35-44',
      '35_44': '35-44',
      '45_to_54': '45-54',
      '45_54': '45-54',
      '55_to_64': '55-64',
      '55_64': '55-64',
      '65_plus': '65+',
      '65+': '65+'
    },
    gender: {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'non_binary': 'Non-Binary',
      'prefer_not_to_say': 'Prefer Not to Say'
    },
    income: {
      'low': 'Low Income ($0-35K)',
      'medium': 'Medium Income ($35-75K)',
      'high': 'High Income ($75K+)',
      'very_high': 'Very High Income ($150K+)'
    },
    category: {
      'restaurant': 'Restaurant',
      'cafe': 'Café',
      'bar': 'Bar',
      'coffee_shop': 'Coffee Shop',
      'bakery': 'Bakery',
      'hotel': 'Hotel',
      'shopping': 'Shopping',
      'entertainment': 'Entertainment',
      'park': 'Park',
      'museum': 'Museum',
      'hospital': 'Hospital',
      'school': 'School',
      'office': 'Office',
      'mall': 'Mall',
      'spa': 'Spa & Wellness',
      'place': 'General Place'
    },
    popularity: {
      'very_low': 'Very Low (0-20%)',
      'low': 'Low (20-40%)',
      'medium': 'Medium (40-60%)',
      'high': 'High (60-80%)',
      'very_high': 'Very High (80-100%)'
    },
    price_level: {
      '1': '$',
      '2': '$$', 
      '3': '$$$',
      '4': '$$$$'
    }
  }
  
  // Return mapped label or format the key as fallback
  return labels[type]?.[key] || 
         key.toString()
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
}

// ✅ Enhanced: Extract specialty dishes from properties with better validation
export const extractSpecialtyDishes = (properties) => {
  if (!properties || !properties.specialty_dishes || !Array.isArray(properties.specialty_dishes)) {
    return []
  }
  
  return properties.specialty_dishes
    .filter(dish => dish && dish.name) // Ensure valid dishes only
    .map(dish => ({
      name: dish.name,
      weight: dish.weight || 0,
      id: dish.id || `dish_${Math.random().toString(36).substr(2, 9)}`,
      description: dish.description || null,
      price: dish.price || null
    }))
}

// ✅ Enhanced: Format business hours for all days with better time parsing
export const formatFullBusinessHours = (hours) => {
  if (!hours || typeof hours !== 'object') return {}
  
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return daysOrder.reduce((formatted, day) => {
    const dayHours = hours[day]
    
    if (!dayHours || !Array.isArray(dayHours) || dayHours.length === 0) {
      formatted[day] = 'Closed'
    } else if (dayHours[0].closed === true) {
      formatted[day] = 'Closed'
    } else {
      const opens = dayHours[0].opens?.replace(/T.*/, '') || ''
      const closes = dayHours[0].closes?.replace(/T.*/, '') || ''
      
      if (opens && closes) {
        // Format time to 12-hour format
        const formatTime = (time) => {
          if (!time) return ''
          const [hours, minutes] = time.split(':')
          const hour = parseInt(hours)
          const ampm = hour >= 12 ? 'PM' : 'AM'
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          return `${hour12}:${minutes} ${ampm}`
        }
        
        formatted[day] = `${formatTime(opens)} - ${formatTime(closes)}`
      } else {
        formatted[day] = 'Hours Available'
      }
    }
    return formatted
  }, {})
}

// ✅ Enhanced: Format search results from Qloo API with comprehensive data extraction
export const formatSearchResults = (data) => {
  if (!data || !data.items || !Array.isArray(data.items)) return []
  
  return data.items
    .filter(item => item && item.location) // Filter out invalid items
    .map((item, index) => ({
      id: item.entity_id || `search_${index}`,
      name: item.name || 'Unknown Location',
      lat: item.location?.lat || item.location?.latitude,
      lng: item.location?.lon || item.location?.longitude,
      popularity: item.popularity || 0,
      address: item.properties?.address || item.location?.address || '',
      type: 'search',
      category: extractMainCategory(item),
      demographics: item.demographics,
      
      // ✅ Enhanced: Add comprehensive properties
      properties: {
        description: item.properties?.description,
        businessRating: item.properties?.business_rating,
        priceLevel: item.properties?.price_level,
        priceRange: item.properties?.price_range,
        phone: item.properties?.phone,
        website: item.properties?.website,
        hours: formatFullBusinessHours(item.properties?.hours),
        image: item.properties?.image?.url,
        neighborhood: item.properties?.neighborhood,
        isClosed: item.properties?.is_closed || false,
        goodFor: item.properties?.good_for || [],
        specialtyDishes: extractSpecialtyDishes(item.properties),
        tags: item.tags || [],
        
        // ✅ Additional metadata
        verified: item.properties?.verified || false,
        hasDelivery: item.properties?.has_delivery || false,
        hasTakeout: item.properties?.has_takeout || false,
        wheelchair_accessible: item.properties?.wheelchair_accessible || false,
        parking: item.properties?.parking || null
      },
      
      // Enhanced metadata
      metadata: {
        source: 'qloo_search',
        timestamp: new Date().toISOString(),
        confidence: item.score || 0.5
      },
      
      rawData: item // Keep full data for detailed view
    }))
    .filter(item => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng))
}

// ✅ Enhanced heatmap data formatting with improved coordinate validation
export const formatHeatmapData = (heatmapData) => {
  if (!Array.isArray(heatmapData)) {
    console.warn('formatHeatmapData: Expected array, received:', typeof heatmapData)
    return []
  }

  return heatmapData
    .map((point, index) => {
      // Handle both old and new data structures
      const location = point.location || {}
      const query = point.query || {}
      
      // Enhanced coordinate validation
      const lat = location.latitude || location.lat
      const lng = location.longitude || location.lng
      
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        console.warn(`Invalid coordinates for heatmap point ${index}:`, { lat, lng })
        return null
      }
      
      // Validate coordinate ranges
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        console.warn(`Coordinates out of range for point ${index}:`, { lat: latNum, lng: lngNum })
        return null
      }
      
      return {
        id: point.id || `heatmap_${index}`,
        lat: latNum,
        lng: lngNum,
        location: {
          latitude: latNum,
          longitude: lngNum,
          name: location.name || `Heat Point ${index + 1}`,
          type: location.type || 'unknown',
          address: location.address || 'Address not available',
          category: location.category || 'general',
          amenities: Array.isArray(location.amenities) ? location.amenities : [],
          businessRating: location.businessRating || null,
          priceLevel: location.priceLevel || null,
          geohash: location.geohash
        },
        metrics: {
          intensity: query.intensity || calculateIntensity(query),
          affinity: query.affinity || 0.5,
          affinity_rank: query.affinity_rank || query.affinityRank || 0.5,
          popularity: query.popularity || 0.5,
          demographicScore: query.demographicScore || (query.affinity || 0.5) * (query.popularity || 0.5),
          trafficScore: query.trafficScore || Math.random() * 0.3 + 0.5,
          proximityScore: query.proximityScore || Math.random() * 0.3 + 0.5
        },
        metadata: point.metadata || {
          timestamp: new Date().toISOString(),
          dataSource: 'locationiq_heatmap',
          confidence: query.affinity_rank || 0.5,
          processing_version: '2.0'
        }
      }
    })
    .filter(Boolean) // Remove null entries
}

// ✅ Enhanced combined data formatting with better categorization
export const formatCombinedData = (combinedResponse) => {
  if (!combinedResponse || typeof combinedResponse !== 'object') {
    console.warn('formatCombinedData: Invalid response structure')
    return []
  }

  const allData = []
  
  // Extract data from different categories
  const categories = ['popularity', 'userLocation', 'demographics', 'restaurants', 'cafes', 'hotels', 'shopping']
  
  categories.forEach(category => {
    const categoryData = combinedResponse[category] || []
    if (Array.isArray(categoryData)) {
      categoryData.forEach((item, index) => {
        const lat = item.lat || item.latitude
        const lng = item.lng || item.longitude
        
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          allData.push({
            id: item.id || `${category}_${index}`,
            name: item.name || `${formatLabel(category, 'category')} ${index + 1}`,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            category: item.category || category,
            type: item.type || category,
            popularity: item.popularity || 0.5,
            rating: item.rating || null,
            address: item.address || '',
            price_level: item.price_level || item.priceLevel || null,
            business_status: item.business_status || 'OPERATIONAL',
            user_ratings_total: item.user_ratings_total || null,
            synthetic: item.synthetic || false,
            
            // Enhanced metadata
            metadata: {
              source: category,
              timestamp: new Date().toISOString(),
              confidence: item.confidence || 0.7
            }
          })
        }
      })
    }
  })

  return allData
}

// ✅ Keep all existing utility functions with the same implementation...
// [Rest of the existing functions remain the same]

// ✅ Helper function to calculate intensity (kept as is)
function calculateIntensity(metrics) {
  if (!metrics) return 0.5
  
  const affinity = metrics.affinity || 0.5
  const popularity = metrics.popularity || 0.5
  const affinityRank = metrics.affinity_rank || metrics.affinityRank || 0.5
  
  return (affinity * 0.4 + affinityRank * 0.3 + popularity * 0.3)
}


// ✅ Helper function for rating distribution
function calculateRatingDistribution(data) {
  return data.reduce((acc, item) => {
    const rating = item.rating || 0;
    if (rating >= 4.5) acc['4.5-5.0'] = (acc['4.5-5.0'] || 0) + 1;
    else if (rating >= 4.0) acc['4.0-4.5'] = (acc['4.0-4.5'] || 0) + 1;
    else if (rating >= 3.5) acc['3.5-4.0'] = (acc['3.5-4.0'] || 0) + 1;
    else if (rating >= 3.0) acc['3.0-3.5'] = (acc['3.0-3.5'] || 0) + 1;
    else if (rating > 0) acc['Below 3.0'] = (acc['Below 3.0'] || 0) + 1;
    return acc;
  }, {});
}




// ✅ Aggregate demographics data from multiple items
export const aggregateDemographics = (items) => {
  const demographics = items
    .map(item => item.demographics)
    .filter(Boolean)
  
  if (demographics.length === 0) return null
  
  const ageGroups = {}
  const genderGroups = {}
  
  demographics.forEach(demo => {
    if (demo.query?.age) {
      Object.entries(demo.query.age).forEach(([key, value]) => {
        ageGroups[key] = (ageGroups[key] || 0) + value
      })
    }
    
    if (demo.query?.gender) {
      Object.entries(demo.query.gender).forEach(([key, value]) => {
        genderGroups[key] = (genderGroups[key] || 0) + value
      })
    }
  })
  
  return {
    age: ageGroups,
    gender: genderGroups,
    totalItems: demographics.length
  }
}

// ✅ Format data for chart visualization
// ✅ Chart data formatting
export const formatChartData = (rawData, type = 'age') => {
  if (!rawData || !rawData[type]) return [];
  
  return Object.entries(rawData[type]).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: parseFloat(value) || 0,
    percentage: '0%' // Will be calculated elsewhere
  }));
};


// ✅ Additional utility functions for data processing

// Validate coordinates
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Format business hours for display
export const formatBusinessHours = (hours) => {
  if (!hours) return 'Hours not available'
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayHours = hours[today]
  
  if (!todayHours || !todayHours[0]) return 'Hours not available'
  
  if (todayHours[0].closed) return 'Closed today'
  
  const opens = todayHours[0].opens?.replace('T', ' ') || ''
  const closes = todayHours[0].closes?.replace('T', ' ') || ''
  
  return `${opens} - ${closes}`
}

// Format price range for display
export const formatPriceRange = (priceRange) => {
  if (!priceRange) return null
  
  return `$${priceRange.from} - $${priceRange.to} ${priceRange.currency?.toUpperCase()}`
}

// Get price level symbol
export const getPriceLevel = (level) => {
  const levels = ['$', '$$', '$$$', '$$$$']
  return levels[level - 1] || 'N/A'
}

// Extract primary tag from tags array
export const extractPrimaryTag = (tags, tagType) => {
  if (!tags || !Array.isArray(tags)) return null
  
  const filteredTags = tags.filter(tag => tag.type === tagType)
  return filteredTags.length > 0 ? filteredTags[0].name : null
}

// Group data by category
export const groupByCategory = (items) => {
  return items.reduce((groups, item) => {
    const category = item.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {})
}

// Sort items by popularity
export const sortByPopularity = (items, ascending = false) => {
  return [...items].sort((a, b) => {
    const aPopularity = a.popularity || 0
    const bPopularity = b.popularity || 0
    return ascending ? aPopularity - bPopularity : bPopularity - aPopularity
  })
}

// Filter items by distance from a point
export const filterByDistance = (items, centerLat, centerLng, maxDistance) => {
  return items.filter(item => {
    if (!item.lat || !item.lng) return false
    const distance = calculateDistance(centerLat, centerLng, item.lat, item.lng)
    return distance <= maxDistance
  })
}

// Generate summary statistics
export const generateSummaryStats = (items) => {
  if (!items || items.length === 0) {
    return {
      total: 0,
      avgPopularity: 0,
      categories: {},
      topCategory: null
    }
  }

  const total = items.length
  const avgPopularity = items.reduce((sum, item) => sum + (item.popularity || 0), 0) / total
  const categories = groupByCategory(items)
  const topCategory = Object.keys(categories).reduce((a, b) => 
    categories[a].length > categories[b].length ? a : b
  )

  return {
    total,
    avgPopularity: Number(avgPopularity.toFixed(2)),
    categories: Object.keys(categories).reduce((acc, key) => {
      acc[key] = categories[key].length
      return acc
    }, {}),
    topCategory
  }
}


// ✅ Enhanced function to aggregate heatmap data by meaningful categories
export const processHeatmapCategories = (heatmapData) => {
  if (!Array.isArray(heatmapData) || heatmapData.length === 0) {
    return {};
  }

  const categoryAggregation = {};
  
  heatmapData.forEach(point => {
    const category = point.location?.category || 
                    point.category || 
                    point.location?.type || 
                    point.type || 
                    'unknown';
    
    if (!categoryAggregation[category]) {
      categoryAggregation[category] = {
        count: 0,
        locations: [],
        totalIntensity: 0,
        totalPopularity: 0,
        averageRating: 0,
        ratingCount: 0
      };
    }
    
    categoryAggregation[category].count++;
    categoryAggregation[category].locations.push(point);
    categoryAggregation[category].totalIntensity += point.metrics?.intensity || 0;
    categoryAggregation[category].totalPopularity += point.metrics?.popularity || 0;
    
    // Calculate average rating if available
    const rating = parseFloat(point.location?.businessRating);
    if (rating && !isNaN(rating)) {
      categoryAggregation[category].averageRating += rating;
      categoryAggregation[category].ratingCount++;
    }
  });

  // Calculate final averages
  Object.keys(categoryAggregation).forEach(category => {
    const data = categoryAggregation[category];
    data.averageIntensity = data.count > 0 ? data.totalIntensity / data.count : 0;
    data.averagePopularity = data.count > 0 ? data.totalPopularity / data.count : 0;
    data.averageRating = data.ratingCount > 0 ? data.averageRating / data.ratingCount : 0;
  });

  return categoryAggregation;
};

// ✅ Enhanced analytics data processing with proper heatmap categorization
// ✅ Enhanced analytics data processing with proper heatmap categorization
export const processAnalyticsData = (combinedData, heatmapData) => {
  const heatmapPoints = heatmapData.length;
  const totalLocations = combinedData.length;
  
  // ✅ FIXED: Process heatmap data by actual categories instead of treating as single "heatmap" entity
  const heatmapCategories = heatmapData.reduce((acc, point) => {
    // Get the actual business category from heatmap point
    const category = point.location?.category || 
                    point.location?.type || 
                    point.category || 
                    point.type || 
                    'unknown';
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  // Extract categories from combined data
  const combinedCategories = combinedData.reduce((acc, item) => {
    const category = item.category || item.type || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  // ✅ FIXED: Merge categories properly - add heatmap category counts to combined categories
  const allCategories = { ...combinedCategories };
  Object.keys(heatmapCategories).forEach(category => {
    allCategories[category] = (allCategories[category] || 0) + heatmapCategories[category];
  });
  
  // ✅ FILTER OUT: Remove generic keys that shouldn't be displayed as categories
  const genericKeys = ['heatmap', 'demographics', 'userlocation', 'popularity'];
  const filteredCategories = Object.fromEntries(
    Object.entries(allCategories).filter(([key]) => !genericKeys.includes(key.toLowerCase()))
  );
  
  // Calculate intensity distribution from heatmap
  const intensityDistribution = heatmapData.reduce((acc, point) => {
    const intensity = point.metrics?.intensity || 0;
    const level = intensity > 0.8 ? 'Very High' : 
                 intensity > 0.6 ? 'High' :
                 intensity > 0.4 ? 'Medium' :
                 intensity > 0.2 ? 'Low' : 'Very Low';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate popularity distribution from combined data
  const popularityDistribution = combinedData.reduce((acc, item) => {
    const popularity = item.popularity || 0;
    const level = popularity > 0.8 ? 'High' : 
                 popularity > 0.5 ? 'Medium' : 'Low';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, { High: 0, Medium: 0, Low: 0 });
  
  // Geographic spread calculation
  const allLatitudes = [
    ...combinedData.map(item => item.lat).filter(lat => lat != null),
    ...heatmapData.map(point => point.lat).filter(lat => lat != null)
  ];
  
  const allLongitudes = [
    ...combinedData.map(item => item.lng).filter(lng => lng != null),
    ...heatmapData.map(point => point.lng).filter(lng => lng != null)
  ];
  
  const geographicSpread = {
    latRange: allLatitudes.length > 0 ? 
      { min: Math.min(...allLatitudes), max: Math.max(...allLatitudes) } : 
      { min: 0, max: 0 },
    lngRange: allLongitudes.length > 0 ? 
      { min: Math.min(...allLongitudes), max: Math.max(...allLongitudes) } : 
      { min: 0, max: 0 }
  };
  
  return {
    totalLocations: Object.values(filteredCategories).reduce((sum, count) => sum + count, 0),
    heatmapPoints,
    categories: filteredCategories, // ✅ NOW contains properly aggregated categories
    heatmapCategoryBreakdown: heatmapCategories, // ✅ Detailed heatmap category analysis
    intensityDistribution,
    popularityDistribution,
    geographicSpread,
    averageIntensity: heatmapPoints > 0 ? 
      heatmapData.reduce((sum, p) => sum + (p.metrics?.intensity || 0), 0) / heatmapPoints : 0,
    topCategory: Object.entries(filteredCategories).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
    ratings: calculateRatingDistribution(combinedData)
  };
};


// ✅ Helper function to format category data for charts
export const formatCategoryDataForChart = (analyticsData) => {
  if (!analyticsData || !analyticsData.categories) {
    return [];
  }

  const totalCount = Object.values(analyticsData.categories).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(analyticsData.categories)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => ({
      category: formatLabel(category, 'category'),
      count,
      percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0',
      rawCategory: category
    }));
};
