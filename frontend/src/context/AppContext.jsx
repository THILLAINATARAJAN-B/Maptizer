import React, { createContext, useContext, useReducer, useCallback } from 'react'

const AppContext = createContext()

// ✅ Helper function to resolve location names
const getLocationName = (location) => {
  if (!location || !location.name) return 'Unknown Location'
  
  if (location.name && !location.name.includes(',')) {
    return location.name
  }
  
  // For coordinate-based locations, try to get a city name
  if (location.name.includes(',')) {
    // Try to extract city name from coordinates format
    const parts = location.name.split(',')
    if (parts.length >= 2) {
      return parts[0].trim() || 'Current Location'
    }
    return 'Current Location'
  }
  
  return location.name
}

const initialState = {
  searchResults: [],
  heatmapData: [],
  combinedData: [],
  selectedLocation: { 
    lat: 11.016845, 
    lng: 76.955833, 
    name: 'Coimbatore',
    displayName: 'Coimbatore',
    searchName: 'Coimbatore'
  },
  searchQuery: '',
  filters: {
    radius: 25,
    popularity: 0.5,
    age: '25_to_29',
    income: 'high',
    take: 20
  },
  loading: {
    search: false,
    heatmap: false,
    insights: false,
    combined: false
  },
  insights: {
    artists: [],
    movies: [],
    books: []
  },
  comparison: null,
  demographics: null
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.value }
      }
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload }
    
    case 'SET_HEATMAP_DATA':
      return { ...state, heatmapData: action.payload }
    
    case 'SET_COMBINED_DATA':
      return { ...state, combinedData: action.payload }
    
    case 'SET_SELECTED_LOCATION':
      return { 
        ...state, 
        selectedLocation: action.payload,
        // Clear data when location changes
        searchResults: [],
        heatmapData: [],
        combinedData: [],
        demographics: null
      }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'UPDATE_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload }
      }
    
    case 'SET_INSIGHTS':
      return {
        ...state,
        insights: { ...state.insights, [action.key]: action.payload }
      }
    
    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload }
    
    case 'SET_DEMOGRAPHICS':
      return { ...state, demographics: action.payload }
    
    case 'RESET_STATE':
      return { ...initialState, selectedLocation: state.selectedLocation }
    
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  const setLoading = useCallback((key, value) => {
    dispatch({ type: 'SET_LOADING', key, value })
  }, [])
  
  const setSearchResults = useCallback((payload) => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload })
  }, [])
  
  const setHeatmapData = useCallback((payload) => {
    dispatch({ type: 'SET_HEATMAP_DATA', payload })
  }, [])
  
  const setCombinedData = useCallback((payload) => {
    dispatch({ type: 'SET_COMBINED_DATA', payload })
  }, [])
  
  // ✅ Enhanced setSelectedLocation with proper naming
  const setSelectedLocation = useCallback((payload) => {
    const locationWithName = {
      ...payload,
      displayName: getLocationName(payload),
      searchName: getLocationName(payload)
    }
    dispatch({ type: 'SET_SELECTED_LOCATION', payload: locationWithName })
  }, [])
  
  const setSearchQuery = useCallback((payload) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload })
  }, [])
  
  const updateFilters = useCallback((payload) => {
    dispatch({ type: 'UPDATE_FILTERS', payload })
  }, [])
  
  const setInsights = useCallback((key, payload) => {
    dispatch({ type: 'SET_INSIGHTS', key, payload })
  }, [])
  
  const setComparison = useCallback((payload) => {
    dispatch({ type: 'SET_COMPARISON', payload })
  }, [])
  
  const setDemographics = useCallback((payload) => {
    dispatch({ type: 'SET_DEMOGRAPHICS', payload })
  }, [])
  
  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [])
  
  const value = {
    ...state,
    setLoading,
    setSearchResults,
    setHeatmapData,
    setCombinedData,
    setSelectedLocation,
    setSearchQuery,
    updateFilters,
    setInsights,
    setComparison,
    setDemographics,
    resetState
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
