import React from 'react'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  DollarSign,
  Users,
  Info,
  X,
  Utensils,
  Wifi,
  Car,
  CreditCard,
  Baby
} from 'lucide-react'

const LocationDetailPopup = ({ location, onClose }) => {
  if (!location) return null

  const { name, properties = {}, popularity, address, demographics } = location

  const formatHours = (hours) => {
    if (!hours) return null
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todayHours = hours[today]
    
    if (!todayHours || !todayHours[0]) return 'Hours not available'
    
    if (todayHours[0].closed) return 'Closed today'
    
    const opens = todayHours[0].opens?.replace('T', '') || ''
    const closes = todayHours[0].closes?.replace('T', '') || ''
    
    return `${opens} - ${closes}`
  }

  const getPriceLevel = (level) => {
    const levels = ['$', '$$', '$$$', '$$$$']
    return levels[level - 1] || 'N/A'
  }

  const getIconForTag = (tagType) => {
    switch (tagType) {
      case 'urn:tag:amenity':
        return <Wifi className="w-4 h-4" />
      case 'urn:tag:parking':
        return <Car className="w-4 h-4" />
      case 'urn:tag:payments':
        return <CreditCard className="w-4 h-4" />
      case 'urn:tag:children':
        return <Baby className="w-4 h-4" />
      case 'urn:tag:offerings':
        return <Utensils className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const groupTagsByType = (tags) => {
    if (!tags) return {}
    
    return tags.reduce((groups, tag) => {
      const type = tag.type || 'other'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(tag)
      return groups
    }, {})
  }

  const tagGroups = groupTagsByType(properties.tags)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {properties.image && (
            <img 
              src={properties.image} 
              alt={name}
              className="w-full h-48 object-cover"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{name}</h2>
            <div className="flex items-center space-x-4">
              {popularity && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{(popularity * 100).toFixed(0)}% Popular</span>
                </div>
              )}
              {properties.businessRating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{properties.businessRating}/5.0</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Description */}
              {properties.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    About
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {properties.description}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Contact & Location</h3>
                
                {address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-700">{address}</p>
                      {properties.neighborhood && (
                        <p className="text-xs text-gray-500">{properties.neighborhood}</p>
                      )}
                    </div>
                  </div>
                )}

                {properties.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`tel:${properties.phone}`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      {properties.phone}
                    </a>
                  </div>
                )}

                {properties.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a 
                      href={properties.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {properties.hours && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-700">{formatHours(properties.hours)}</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Ratings */}
              <div className="flex items-center space-x-6">
                {properties.priceLevel && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {getPriceLevel(properties.priceLevel)}
                    </span>
                  </div>
                )}
              </div>

              {/* Specialty Dishes */}
              {properties.specialtyDishes && properties.specialtyDishes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specialty Dishes</h3>
                  <div className="space-y-1">
                    {properties.specialtyDishes.map((dish, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {dish.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Good For */}
              {properties.goodFor && properties.goodFor.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Good For</h3>
                  <div className="flex flex-wrap gap-2">
                    {properties.goodFor.map((item, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Demographics */}
              {demographics && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Demographics
                  </h3>
                  <div className="space-y-3">
                    {/* Age Distribution */}
                    {demographics.query?.age && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Age Distribution</h4>
                        <div className="space-y-1">
                          {Object.entries(demographics.query.age).map(([age, value]) => (
                            <div key={age} className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">
                                {age.replace('_', '-').replace('and_younger', '-').replace('and_older', '+')}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${value > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.abs(value) * 100}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gender Distribution */}
                    {demographics.query?.gender && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h4>
                        <div className="space-y-1">
                          {Object.entries(demographics.query.gender).map(([gender, value]) => (
                            <div key={gender} className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 capitalize">{gender}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${value > 0 ? 'bg-blue-500' : 'bg-pink-500'}`}
                                    style={{ width: `${Math.abs(value) * 100}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${value > 0 ? 'text-blue-600' : 'text-pink-600'}`}>
                                  {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features & Amenities */}
              {Object.keys(tagGroups).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features & Amenities</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {Object.entries(tagGroups).map(([type, tags]) => (
                      <div key={type}>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                          {getIconForTag(type)}
                          <span className="ml-1">
                            {type.replace('urn:tag:', '').replace('_', ' ')}
                          </span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 8).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {tags.length > 8 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              +{tags.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationDetailPopup
