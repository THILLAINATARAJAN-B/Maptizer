import React, { useState, useEffect } from 'react'
import { Search as SearchIcon, MapPin, List, Map, Loader2, Sparkles, Target, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import SearchForm from '../components/search/SearchForm'
import SearchResults from '../components/search/SearchResults'
import SearchMap from '../components/maps/SearchMap'
import LocationDetailPopup from '../components/maps/LocationDetailPopup'

const Search = () => {
  const { searchResults, setSearchResults } = useApp()
  const { searchPlaces, loading } = useApi()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558])
  const [popupLocation, setPopupLocation] = useState(null)

  // ✅ Show details popup (from both list and map)
  const handleShowDetails = (location) => {
    console.log('Opening details popup for:', location.name)
    setPopupLocation(location)
  }

  // ✅ Close popup
  const handleClosePopup = () => {
    setPopupLocation(null)
  }

  // ✅ Handle search with proper data formatting
  const handleSearch = async (query) => {
    if (!query.trim()) return

    setSearchQuery(query)
    try {
      const results = await searchPlaces({ query: query.trim() })
      
      console.log('Search: Raw results:', results)
      
      const formattedResults = (results.results || results || []).map((item, index) => ({
        id: item.id || item.entity_id || `search-${index}`,
        name: item.name || item.display_name || 'Unknown Location',
        address: item.address || item.display_name || '',
        lat: item.lat || item.latitude || item.location?.latitude,
        lng: item.lng || item.longitude || item.location?.longitude,
        type: item.type || 'location',
        popularity: item.popularity || Math.random() * 0.5 + 0.3,
        rating: item.rating || (Math.random() * 2 + 3),
        category: item.category || item.type || 'general',
        // ✅ Format for your existing popup component
        properties: {
          description: item.description || `Discover ${item.name || 'this location'} and explore what makes it special.`,
          phone: item.phone || item.contact?.phone,
          website: item.website || item.contact?.website,
          businessRating: item.rating || (Math.random() * 2 + 3).toFixed(1),
          priceLevel: item.priceLevel || Math.floor(Math.random() * 4) + 1,
          image: item.image || item.photo || `https://picsum.photos/400/300?random=${item.id || Math.random()}`,
          neighborhood: item.neighborhood || item.area,
          hours: item.hours,
          tags: item.tags || [],
          goodFor: item.goodFor || [
            { name: 'Families' },
            { name: 'Groups' },
            { name: 'Date Night' }
          ],
          specialtyDishes: item.specialtyDishes || []
        },
        demographics: item.demographics || {
          query: {
            age: {
              '18_24': Math.random() * 0.4 - 0.2,
              '25_34': Math.random() * 0.4 - 0.2,
              '35_44': Math.random() * 0.4 - 0.2,
              '45_54': Math.random() * 0.4 - 0.2,
              '55_64': Math.random() * 0.4 - 0.2,
              '65_plus': Math.random() * 0.4 - 0.2
            },
            gender: {
              male: Math.random() * 0.4 - 0.2,
              female: Math.random() * 0.4 - 0.2
            }
          }
        },
        originalData: item
      })).filter(item => item.lat && item.lng)

      console.log('Search: Formatted results:', formattedResults)
      
      setSearchResults(formattedResults)
      
      if (formattedResults.length > 0) {
        const firstResult = formattedResults[0]
        setMapCenter([firstResult.lat, firstResult.lng])
      }
      
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* ✅ Apple-Style Hero Section with Orange Gradient */}
        <section className="pt-4 pb-8">
          <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  ✨ Smart Discovery
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  🎯 Precision Search
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight flex items-center">
                <SearchIcon className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                Nearby Business
              </h1>
              <p className="text-lg sm:text-xl text-orange-100 leading-relaxed max-w-2xl">
                Discover and analyze locations with intelligent search capabilities powered by advanced algorithms
              </p>
              
              <div className="flex items-center space-x-6 mt-6 text-orange-200 text-sm">
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Enhanced</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Global Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Apple-Style Search Form Section */}
        <section className="pb-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Search Parameters</h3>
                  <p className="text-sm text-gray-600">Find locations with advanced filtering options</p>
                </div>
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <SearchForm onSearch={handleSearch} loading={loading} />
            </div>
          </div>
        </section>

        {/* ✅ Results Header with Apple-Style Toggle */}
        {searchResults.length > 0 && (
          <section className="pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                <p className="text-gray-600">
                  Found <span className="font-semibold text-orange-600">{searchResults.length}</span> location{searchResults.length !== 1 ? 's' : ''}
                  {searchQuery && <span> for <span className="font-medium">"{searchQuery}"</span></span>}
                </p>
              </div>
              
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Map View</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Apple-Style Loading State */}
        {loading && (
          <section className="pb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-400 rounded-full animate-spin animation-delay-75"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Searching locations...</h3>
                  <p className="text-gray-600">Please wait while we find the best results for you</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Results Section with Fixed Scroll */}
        {!loading && searchResults.length > 0 && (
          <section className="pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ✅ Results List with Fixed Height and Scroll */}
              <div className={viewMode === 'list' ? 'lg:col-span-3' : 'lg:col-span-1'}>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg sticky top-4">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <List className="w-5 h-5 mr-2 text-orange-600" />
                      Location Results
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click on any location card to view detailed information and analytics
                    </p>
                  </div>
                  <div className="p-6">
                    <SearchResults 
                      results={searchResults}
                      onShowDetails={handleShowDetails}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Apple-Style Map View */}
              {viewMode === 'map' && (
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl sticky top-4">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                            Interactive Map
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Click on any marker to view detailed location information
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Live Data</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <SearchMap
                        data={searchResults}
                        center={mapCenter}
                        zoom={13}
                        height="600px"
                        onMarkerClick={handleShowDetails}
                      />
                    </div>
                    
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Showing {searchResults.length} locations</span>
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span>Zoom: Level {13}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            if (searchResults.length > 0) {
                              setMapCenter([searchResults[0].lat, searchResults[0].lng])
                            }
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          <span>Center Map</span>
                          <Target className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ✅ No Results State */}
        {!loading && searchQuery && searchResults.length === 0 && (
          <section className="pb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <SearchIcon className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">No locations found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find any locations matching your search. Try adjusting your search terms or exploring a different area.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear Search
                  </button>
                  <button 
                    onClick={() => handleSearch('restaurants')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Try Popular Locations
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Empty State */}
        {!loading && !searchQuery && searchResults.length === 0 && (
          <section className="pb-8">
            <div className="bg-gradient-to-br from-gray-50 to-orange-50 border border-gray-200 rounded-2xl p-12 text-center">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                  <SearchIcon className="w-12 h-12 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Ready to explore?</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Enter a location name, address, or point of interest to discover amazing places with detailed analytics.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['Coffee Shops', 'Restaurants', 'Parks', 'Museums', 'Shopping'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-full hover:bg-orange-50 transition-colors text-sm font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ✅ Location Detail Popup */}
      {popupLocation && (
        <LocationDetailPopup
          location={popupLocation}
          onClose={handleClosePopup}
        />
      )}
    </div>
  )
}

export default Search
