export const API_ENDPOINTS = {
  HEALTH: '/health',
  SEARCH: '/api/search',
  HEATMAP: '/api/heatmap',
  ENTITY_DETAILS: '/api/entity-details',
  COMPARE_ENTITIES: '/api/compare-entities',
  ARTIST_INSIGHTS: '/api/artist-insights',
  MOVIE_INSIGHTS: '/api/movie-insights',
  BOOK_INSIGHTS: '/api/book-insights',
  SUMMARY: '/api/summary',
  COMBINED: '/api/qloo-combined'
}

export const DEFAULT_LOCATION = {
  lat: 11.016845,
  lng: 76.955833,
  name: 'Coimbatore'
}

export const AGE_GROUPS = [
  { value: '18_to_24', label: '18-24' },
  { value: '25_to_29', label: '25-29' },
  { value: '30_to_34', label: '30-34' },
  { value: '35_to_44', label: '35-44' },
  { value: '45_to_54', label: '45-54' },
  { value: '55_to_64', label: '55-64' },
  { value: '65_plus', label: '65+' }
]

export const INCOME_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export const MARKER_COLORS = {
  popularity: '#f59e0b',
  userLocation: '#10b981',
  demographics: '#ef4444',
  coffee: '#8b5cf6',
  restaurant: '#06b6d4',
  default: '#3b82f6'
}
