import React, { useState, useEffect } from 'react'
import {
  Music,
  Film,
  Book,
  Star,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useApi } from '../../hooks/useApi'
import LoadingSpinner from '../common/LoadingSpinner'

const InsightsPanel = () => {
  const { selectedLocation } = useApp()
  const { getInsights } = useApi()
  
  const [activeTab, setActiveTab] = useState('artists')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    artists: [],
    movies: [],
    books: []
  })

  const tabs = [
    { key: 'artists', label: 'Artists', icon: Music },
    { key: 'movies', label: 'Movies', icon: Film },
    { key: 'books', label: 'Books', icon: Book }
  ]

  useEffect(() => {
    if (!selectedLocation?.name) {
      setData({ artists: [], movies: [], books: [] })
      return
    }
    loadInsights(activeTab)
  }, [activeTab, selectedLocation])

  const loadInsights = async (type) => {
    setLoading(true)
    try {
      const params = {
        location: selectedLocation.name,
        take: 15
      }

      if (type === 'movies') {
        params.ratingMin = 3.5
      } else if (type === 'books') {
        params.publication_year_min = 2018
      } else if (type === 'artists') {
        params.age = '25_to_29'
      }

      const response = await getInsights(type, params)
      console.log(`${type} response:`, response) // ✅ Debug log
      
      // ✅ Safe data extraction with fallbacks
      let entities = []
      if (response && typeof response === 'object') {
        entities = response[type] || 
                  response.entities || 
                  response.results?.entities || 
                  response.results || 
                  []
      }
      
      // ✅ Ensure entities is always an array
      if (!Array.isArray(entities)) {
        console.warn(`Expected array for ${type}, got:`, typeof entities, entities)
        entities = []
      }

      setData(prev => ({ 
        ...prev, 
        [type]: entities 
      }))
    } catch (error) {
      console.error(`Failed to load ${type} insights:`, error)
      // ✅ Set empty array on error
      setData(prev => ({ 
        ...prev, 
        [type]: [] 
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      {/* ✅ Apple-Style Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Cultural Insights
            </h3>
            <p className="text-sm text-gray-600 mt-1">Discover trending content in your area</p>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {selectedLocation?.name}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ✅ Enhanced Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                    : 'bg-gray-200 group-hover:bg-gray-300'
                }`}>
                  <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ✅ Content Area */}
        {loading ? (
          <LoadingSpinner text={`Loading ${activeTab}...`} />
        ) : (
          <InsightsList items={data[activeTab]} type={activeTab} />
        )}
      </div>
    </div>
  )
}

// ✅ Fixed InsightsList Component with Safe Array Handling
const InsightsList = ({ items, type }) => {
  // ✅ CRITICAL FIX: Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : []
  
  if (safeItems.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-orange-300" />
        <h4 className="text-lg font-semibold text-gray-900 mb-2">No {type} insights available</h4>
        <p className="text-gray-600">
          Try selecting a different location or check back later for updates.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
      {safeItems.map((item, index) => (
        <InsightItem 
          key={item.entity_id || `${type}-${index}`} 
          item={item} 
          type={type} 
        />
      ))}
    </div>
  )
}

// ✅ Enhanced InsightItem Component
const InsightItem = ({ item, type }) => {
  const getTypeSpecificInfo = () => {
    switch (type) {
      case 'movies':
        return (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {item.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="font-medium">{item.rating.toFixed(1)}</span>
              </div>
            )}
            {item.release_year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{item.release_year}</span>
              </div>
            )}
            {item.genre && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {item.genre}
              </span>
            )}
          </div>
        )
      
      case 'books':
        return (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {item.publication_year && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{item.publication_year}</span>
              </div>
            )}
            {item.author && (
              <span className="text-purple-700 font-medium">by {item.author}</span>
            )}
          </div>
        )
      
      case 'artists':
        return (
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {item.genre && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {item.genre}
              </span>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="group p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-orange-800 transition-colors">
            {item.name}
          </h4>
          {getTypeSpecificInfo()}
          
          {item.popularity && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Popularity</span>
                <span className="font-bold text-orange-600">{(item.popularity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${item.popularity * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InsightsPanel
