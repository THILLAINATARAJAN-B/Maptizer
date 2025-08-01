import React from 'react'
import { MapPin, Star, Users, TrendingUp, Clock, Navigation, Phone, Globe } from 'lucide-react'

const MarkerPopup = ({ item }) => {
  const getTypeIcon = (type) => {
    const iconConfig = {
      'popularity': { icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
      'demographics': { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100' },
      'trending': { icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-100' },
      'location': { icon: MapPin, color: 'text-orange-500', bgColor: 'bg-orange-100' },
      'default': { icon: MapPin, color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
    
    const config = iconConfig[type] || iconConfig.default
    return config
  }

  const typeConfig = getTypeIcon(item.type)
  const TypeIcon = typeConfig.icon

  return (
    <div className="p-4 min-w-[280px] max-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {item.name}
          </h3>
          {item.category && (
            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {item.category}
            </span>
          )}
        </div>
      </div>
      
      {/* Address */}
      {item.address && (
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">{item.address}</p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {item.popularity !== undefined && (
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-medium text-orange-700">Popularity</span>
            </div>
            <span className="text-lg font-bold text-orange-900">
              {(item.popularity * 100).toFixed(0)}%
            </span>
          </div>
        )}
        
        {item.rating !== undefined && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-700">Rating</span>
            </div>
            <span className="text-lg font-bold text-yellow-900">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}
        
        {item.value !== undefined && (
          <div className="bg-blue-50 rounded-lg p-3 col-span-2">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Value Score</span>
            </div>
            <span className="text-lg font-bold text-blue-900">
              {item.value.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Status</span>
          </div>
          <span className="font-medium text-green-600">Open Now</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Distance</span>
          </div>
          <span className="font-medium text-gray-900">
            {(Math.random() * 2 + 0.5).toFixed(1)}km
          </span>
        </div>
      </div>
      
      {/* Contact Info */}
      {(item.phone || item.website) && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          {item.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${item.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                {item.phone}
              </a>
            </div>
          )}
          {item.website && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <a 
                href={item.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Demographics Footer */}
      {item.demographics && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">Demographics Available</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Detailed demographic analysis and insights included
          </p>
        </div>
      )}
    </div>
  )
}

export default MarkerPopup
