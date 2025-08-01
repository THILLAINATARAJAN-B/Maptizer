import React, { useState } from 'react'
import { Search, MapPin, Sliders, Loader2, X, ChevronDown, Filter } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useApi } from '../../hooks/useApi'
import { formatSearchResults, aggregateDemographics } from '../../services/dataService'

const SearchForm = ({ onSearch }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedLocation, 
    filters, 
    updateFilters,
    setSearchResults,
    setDemographics,
    loading
  } = useApp()
  
  const { searchPlaces } = useApi()
  const [showFilters, setShowFilters] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const response = await searchPlaces({
        query: searchQuery,
        lat: selectedLocation.lat,
        long: selectedLocation.lng,
        radius: filters.radius,
        page: 1,
        take: filters.take
      })

      const formattedResults = formatSearchResults(response)
      setSearchResults(formattedResults)
      
      const aggregatedDemographics = aggregateDemographics(formattedResults)
      setDemographics(aggregatedDemographics)

      if (onSearch) {
        onSearch(formattedResults)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="space-y-6">
      {/* Main Search Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input Container */}
        <div className="relative">
          <div className="flex items-center space-x-3">
            {/* Main Search Input */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for places, restaurants, cafes..."
                className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                disabled={loading?.search}
              />
              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-2xl transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                showFilters
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }`}
              title="Toggle Filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading?.search || !searchQuery.trim()}
              className="flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {loading?.search ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </div>
              )}
            </button>
          </div>

          {/* Location Display */}
          <div className="flex items-center space-x-2 mt-3 px-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Searching near</span>
              <span className="font-medium text-gray-900">
                {selectedLocation?.displayName || selectedLocation?.name || 'Current Location'}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg animate-slide-down">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sliders className="w-5 h-5 mr-2 text-orange-600" />
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Radius Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Search Radius
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters?.radius || 15}
                    onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${((filters?.radius || 15) / 100) * 100}%, #e5e7eb ${((filters?.radius || 15) / 100) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 km</span>
                    <span className="font-semibold text-orange-600">
                      {filters?.radius || 15} km
                    </span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>

              {/* Results Count Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Number of Results
                </label>
                <div className="relative">
                  <select
                    value={filters?.take || 20}
                    onChange={(e) => updateFilters({ take: parseInt(e.target.value) })}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value={10}>10 results</option>
                    <option value={20}>20 results</option>
                    <option value={50}>50 results</option>
                    <option value={100}>100 results</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Popularity Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Minimum Popularity
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters?.popularity || 0.3}
                    onChange={(e) => updateFilters({ popularity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${((filters?.popularity || 0.3) * 100)}%, #e5e7eb ${((filters?.popularity || 0.3) * 100)}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-semibold text-orange-600">
                      {((filters?.popularity || 0.3) * 100).toFixed(0)}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  updateFilters({ radius: 15, take: 20, popularity: 0.3 })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Filters applied:</span>
                <span className="font-semibold text-orange-600">
                  {filters?.radius || 15}km • {filters?.take || 20} results • {((filters?.popularity || 0.3) * 100).toFixed(0)}% min popularity
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchForm
