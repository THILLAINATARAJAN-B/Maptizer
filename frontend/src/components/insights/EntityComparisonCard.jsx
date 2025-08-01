import React from 'react'
import { MapPin, Star, DollarSign, Clock, Users, Wifi, Car, Sparkles } from 'lucide-react'

const EntityComparisonCard = ({ entity, label, color }) => {
  if (!entity) return null

  const { name, address, properties = {}, popularity, demographics } = entity

  // ✅ REPLACE the getTopTags function (around line 15):
  const getTopTags = (tags, limit = 4) => {
    if (!tags || !Array.isArray(tags)) return []
    
    try {
      const priorityOrder = ['urn:tag:category', 'urn:tag:offerings', 'urn:tag:amenity', 'urn:tag:dining_options']
      
      const sortedTags = tags
        .filter(tag => tag && tag.name) // ✅ Filter out invalid tags
        .sort((a, b) => {
          const aIndex = priorityOrder.indexOf(a.type || '')
          const bIndex = priorityOrder.indexOf(b.type || '')
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1
          return 0
        })
      
      return sortedTags.slice(0, limit)
    } catch (error) {
      console.warn('Error processing tags:', error)
      return []
    }
  }


  const topTags = getTopTags(properties.tags)

  // Enhanced color mapping
  const colorConfig = {
    'bg-gradient-to-br from-blue-500 to-indigo-600': {
      bgClass: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderClass: 'border-blue-200',
      hoverClass: 'hover:border-blue-300 hover:shadow-blue-100',
      tagClass: 'bg-blue-100 text-blue-800',
      accentClass: 'text-blue-600'
    },
    'bg-gradient-to-br from-purple-500 to-violet-600': {
      bgClass: 'bg-gradient-to-br from-purple-50 to-violet-50',
      borderClass: 'border-purple-200',
      hoverClass: 'hover:border-purple-300 hover:shadow-purple-100',
      tagClass: 'bg-purple-100 text-purple-800',
      accentClass: 'text-purple-600'
    }
  }

  const config = colorConfig[color] || colorConfig['bg-gradient-to-br from-blue-500 to-indigo-600']

  return (
    <div className={`group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${config.bgClass} ${config.borderClass} ${config.hoverClass}`}>
      {/* ✅ Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {label}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-lg leading-tight">{name}</h4>
              <div className="flex items-center space-x-1 mt-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Entity {label}</span>
              </div>
            </div>
          </div>
          
          {address && (
            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 leading-relaxed">{address}</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Apple-Style Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {popularity !== undefined && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-3 text-center group-hover:bg-white transition-colors duration-300">
            <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-lg">{(popularity * 100).toFixed(0)}%</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">Popularity</div>
          </div>
        )}
        
        {properties.businessRating && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-3 text-center group-hover:bg-white transition-colors duration-300">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="font-bold text-lg">{properties.businessRating}</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">Rating</div>
          </div>
        )}
        
        {properties.priceLevel && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-3 text-center group-hover:bg-white transition-colors duration-300">
            <div className="flex items-center justify-center space-x-1 text-emerald-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold text-lg">{'$'.repeat(properties.priceLevel)}</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">Price</div>
          </div>
        )}

        {demographics && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-3 text-center group-hover:bg-white transition-colors duration-300">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="font-bold text-lg">✓</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">Demographics</div>
          </div>
        )}
      </div>

      {/* ✅ Enhanced Features Section */}
      {topTags.length > 0 && (
        <div className="pt-4 border-t border-white/50">
          <div className="flex items-center space-x-2 mb-3">
            <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Key Features
            </h5>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag, index) => (
              <span 
                key={index}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${config.tagClass} transition-all duration-200 hover:scale-105`}
              >
                {tag.name}
              </span>
            ))}
            {properties.tags && properties.tags.length > topTags.length && (
              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                +{properties.tags.length - topTags.length} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* ✅ Enhanced Quick Info Icons */}
      <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-white/50">
        {properties.phone && (
          <div className="flex flex-col items-center space-y-1 group/icon">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover/icon:bg-green-200 transition-colors">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Contact</span>
          </div>
        )}
        {properties.website && (
          <div className="flex flex-col items-center space-y-1 group/icon">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover/icon:bg-blue-200 transition-colors">
              <Wifi className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Online</span>
          </div>
        )}
        {properties.tags?.some(tag => tag.type === 'urn:tag:parking') && (
          <div className="flex flex-col items-center space-y-1 group/icon">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover/icon:bg-purple-200 transition-colors">
              <Car className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Parking</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EntityComparisonCard
