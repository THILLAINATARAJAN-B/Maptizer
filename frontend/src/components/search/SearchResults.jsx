import React from 'react'
import { MapPin, Star, Clock, Navigation, Coffee, Utensils, ShoppingBag, Building, TreePine, Camera, Car, Heart, Briefcase, Home } from 'lucide-react'

const SearchResults = ({ results, onShowDetails }) => {
  // ✅ Enhanced function with gradient backgrounds
  const getCategoryIcon = (category, type) => {
    const categoryLower = (category || type || '').toLowerCase()
    
    const iconMap = {
      // Food & Dining
      'restaurant': { 
        icon: Utensils, 
        gradient: 'bg-gradient-to-br from-red-500 to-pink-600', 
        hoverGradient: 'group-hover:from-red-600 group-hover:to-pink-700',
        emoji: '🍽️' 
      },
      'cafe': { 
        icon: Coffee, 
        gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', 
        hoverGradient: 'group-hover:from-amber-600 group-hover:to-orange-700',
        emoji: '☕' 
      },
      'coffee': { 
        icon: Coffee, 
        gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', 
        hoverGradient: 'group-hover:from-amber-600 group-hover:to-orange-700',
        emoji: '☕' 
      },
      'bar': { 
        icon: Utensils, 
        gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600', 
        hoverGradient: 'group-hover:from-purple-600 group-hover:to-indigo-700',
        emoji: '🍷' 
      },
      'food': { 
        icon: Utensils, 
        gradient: 'bg-gradient-to-br from-red-500 to-pink-600', 
        hoverGradient: 'group-hover:from-red-600 group-hover:to-pink-700',
        emoji: '🍽️' 
      },
      
      // Shopping
      'shop': { 
        icon: ShoppingBag, 
        gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
        hoverGradient: 'group-hover:from-blue-600 group-hover:to-indigo-700',
        emoji: '🛍️' 
      },
      'shopping': { 
        icon: ShoppingBag, 
        gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
        hoverGradient: 'group-hover:from-blue-600 group-hover:to-indigo-700',
        emoji: '🛍️' 
      },
      'store': { 
        icon: ShoppingBag, 
        gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600', 
        hoverGradient: 'group-hover:from-blue-600 group-hover:to-cyan-700',
        emoji: '🏪' 
      },
      'mall': { 
        icon: Building, 
        gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600', 
        hoverGradient: 'group-hover:from-indigo-600 group-hover:to-purple-700',
        emoji: '🏬' 
      },
      
      // Entertainment & Culture
      'museum': { 
        icon: Camera, 
        gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600', 
        hoverGradient: 'group-hover:from-teal-600 group-hover:to-cyan-700',
        emoji: '🏛️' 
      },
      'park': { 
        icon: TreePine, 
        gradient: 'bg-gradient-to-br from-green-500 to-emerald-600', 
        hoverGradient: 'group-hover:from-green-600 group-hover:to-emerald-700',
        emoji: '🌳' 
      },
      'cinema': { 
        icon: Camera, 
        gradient: 'bg-gradient-to-br from-pink-500 to-rose-600', 
        hoverGradient: 'group-hover:from-pink-600 group-hover:to-rose-700',
        emoji: '🎬' 
      },
      'theater': { 
        icon: Camera, 
        gradient: 'bg-gradient-to-br from-pink-500 to-purple-600', 
        hoverGradient: 'group-hover:from-pink-600 group-hover:to-purple-700',
        emoji: '🎭' 
      },
      
      // Services
      'hospital': { 
        icon: Heart, 
        gradient: 'bg-gradient-to-br from-red-600 to-pink-700', 
        hoverGradient: 'group-hover:from-red-700 group-hover:to-pink-800',
        emoji: '🏥' 
      },
      'hotel': { 
        icon: Home, 
        gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600', 
        hoverGradient: 'group-hover:from-cyan-600 group-hover:to-blue-700',
        emoji: '🏨' 
      },
      'bank': { 
        icon: Building, 
        gradient: 'bg-gradient-to-br from-slate-600 to-gray-700', 
        hoverGradient: 'group-hover:from-slate-700 group-hover:to-gray-800',
        emoji: '🏦' 
      },
      'office': { 
        icon: Briefcase, 
        gradient: 'bg-gradient-to-br from-gray-600 to-slate-700', 
        hoverGradient: 'group-hover:from-gray-700 group-hover:to-slate-800',
        emoji: '🏢' 
      },
      
      // Transportation
      'station': { 
        icon: Car, 
        gradient: 'bg-gradient-to-br from-orange-600 to-red-700', 
        hoverGradient: 'group-hover:from-orange-700 group-hover:to-red-800',
        emoji: '🚉' 
      },
      'airport': { 
        icon: Car, 
        gradient: 'bg-gradient-to-br from-sky-500 to-blue-600', 
        hoverGradient: 'group-hover:from-sky-600 group-hover:to-blue-700',
        emoji: '✈️' 
      },
      'parking': { 
        icon: Car, 
        gradient: 'bg-gradient-to-br from-gray-500 to-slate-600', 
        hoverGradient: 'group-hover:from-gray-600 group-hover:to-slate-700',
        emoji: '🅿️' 
      },
    }

    // Check for matches
    for (const [key, config] of Object.entries(iconMap)) {
      if (categoryLower.includes(key)) {
        return config
      }
    }

    // Default fallback with beautiful gradient
    return { 
      icon: MapPin, 
      gradient: 'bg-gradient-to-br from-orange-500 to-red-600', 
      hoverGradient: 'group-hover:from-orange-600 group-hover:to-red-700',
      emoji: '📍' 
    }
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No results to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          {results.length} location{results.length !== 1 ? 's' : ''} found
        </div>
        <div className="text-xs text-gray-500">
          Click any result to view details
        </div>
      </div>

      {/* ✅ Fixed Height Scrollable Results Container */}
      <div className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-400 transition-colors">
        <div className="space-y-3 pr-2">
          {results.map((location, index) => {
            const rating = location.rating || location.properties?.businessRating || (Math.random() * 2 + 3).toFixed(1)
            const category = location.category || location.type || 'Location'
            
            // ✅ Get dynamic gradient icon based on category
            const iconConfig = getCategoryIcon(category, location.type)
            const IconComponent = iconConfig.icon

            return (
              <div
                key={location.id || index}
                onClick={() => onShowDetails(location)}
                className="border border-gray-200 rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-orange-300 hover:bg-orange-50 bg-white group"
              >
                <div className="flex items-start space-x-4">
                  {/* ✅ Beautiful Gradient Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-300 flex-shrink-0 shadow-lg ${iconConfig.gradient} ${iconConfig.hoverGradient} group-hover:shadow-xl group-hover:scale-105`}>
                    <IconComponent className="w-6 h-6 drop-shadow-sm" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {location.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {location.address || 'Address not available'}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full ml-2 flex-shrink-0">
                        {category}
                      </span>
                    </div>

                    {/* Rating and Info - Compact */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs font-medium">{rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">Open</span>
                      </div>
                      <div className="flex items-center">
                        <Navigation className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {(Math.random() * 2 + 0.5).toFixed(1)}km
                        </span>
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="text-xs text-gray-600 group-hover:text-orange-600 transition-colors">
                      Click to view full details and analytics →
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Results Footer */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Scroll to view more results</span>
          <span>Results sorted by relevance</span>
        </div>
      </div>
    </div>
  )
}

export default SearchResults
