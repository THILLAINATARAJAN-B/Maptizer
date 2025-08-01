import React, { useState } from 'react'
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  MapPin,
  Users,
  Coffee,
  ShoppingBag,
  Building,
  Utensils,
  Sparkles
} from 'lucide-react'

const CategoryBreakdown = ({ analyticsData, combinedData = [] }) => {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [viewMode, setViewMode] = useState('percentage')

  if (!analyticsData || !analyticsData.categories) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-orange-600" />
            Category Breakdown
          </h3>
        </div>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-orange-300" />
          <p className="text-gray-600">No category data available</p>
        </div>
      </div>
    )
  }

  // Get category icon with enhanced mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      restaurant: Utensils,
      cafe: Coffee,
      coffee: Coffee,
      bar: Utensils,
      food: Utensils,
      shop: ShoppingBag,
      shopping: ShoppingBag,
      store: ShoppingBag,
      mall: Building,
      hotel: Building,
      popularity: Star,
      userlocation: MapPin,
      demographics: Users
    }
    return iconMap[category.toLowerCase()] || MapPin
  }

  // Enhanced gradient colors
  const categoryGradients = [
    'from-orange-500 to-red-600',
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-500',
    'from-cyan-500 to-blue-600',
    'from-teal-500 to-green-600'
  ]

  const categoryBgColors = [
    'bg-orange-50 border-orange-200',
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-pink-50 border-pink-200',
    'bg-yellow-50 border-yellow-200',
    'bg-cyan-50 border-cyan-200',
    'bg-teal-50 border-teal-200'
  ]

  // Prepare category data
  // In your CategoryBreakdown.jsx, update the categoryEntries preparation:
const categoryEntries = Object.entries(analyticsData.categories || {})
  .filter(([category]) => {
    const genericCategories = ['heatmap', 'demographics', 'userlocation', 'popularity'];
    return !genericCategories.includes(category.toLowerCase());
  })
  .sort(([,a], [,b]) => b - a)
  .map(([category, count], index) => {
    const percentage = ((count / (analyticsData.totalLocations || 1)) * 100).toFixed(1)
    const Icon = getCategoryIcon(category)
    const gradient = categoryGradients[index % categoryGradients.length]
    const bgColor = categoryBgColors[index % categoryBgColors.length]
    
    const sampleLocations = combinedData
      .filter(item => (item.category || item.type || '').toLowerCase() === category.toLowerCase())
      .slice(0, 3)
    
    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage,
      Icon,
      gradient,
      bgColor,
      sampleLocations,
      originalName: category
    }
  });


  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  return (
    <div className="space-y-6">
      {/* ✅ Main Category Breakdown Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-orange-600" />
                Category Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">Distribution across business categories</p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'percentage' ? 'count' : 'percentage')}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>{viewMode === 'percentage' ? 'Show Count' : 'Show %'}</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {categoryEntries.map((category, index) => (
              <div key={category.name} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                        <category.Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1">{category.name}</div>
                        <div className="text-sm text-gray-600">
                          {category.count} locations
                          {category.sampleLocations.length > 0 && (
                            <span className="ml-2">
                              • {category.sampleLocations[0].name}
                              {category.sampleLocations.length > 1 && ` +${category.sampleLocations.length - 1} more`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {viewMode === 'percentage' ? `${category.percentage}%` : category.count}
                        </div>
                        <div className="text-xs text-gray-500">
                          {viewMode === 'percentage' ? 'of total' : 'locations'}
                        </div>
                      </div>
                      {expandedCategory === category.name ? (
                        <ChevronDown className="w-5 h-5 text-orange-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${category.gradient}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {expandedCategory === category.name && category.sampleLocations.length > 0 && (
                  <div className={`px-6 py-4 ${category.bgColor} border-t border-gray-200`}>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Sample Locations:
                    </h5>
                    <div className="space-y-2">
                      {category.sampleLocations.map((location, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">{location.name}</span>
                          </div>
                          {location.popularity && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">
                                {(location.popularity * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Summary Stats Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Category Insights
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {categoryEntries.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">Total Categories</div>
              <div className="text-xs text-blue-500 mt-1">
                Diverse location types
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {categoryEntries.length > 0 ? categoryEntries[0].name : 'N/A'}
              </div>
              <div className="text-sm text-green-600 font-medium">Top Category</div>
              <div className="text-xs text-green-500 mt-1">
                {categoryEntries.length > 0 ? `${categoryEntries[0].percentage}% of locations` : 'No data'}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {(analyticsData.totalLocations || 0) > 0 ? 
                  ((analyticsData.totalLocations || 0) / categoryEntries.length).toFixed(1) : '0'}
              </div>
              <div className="text-sm text-purple-600 font-medium">Avg per Category</div>
              <div className="text-xs text-purple-500 mt-1">
                Distribution balance
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {categoryEntries.filter(cat => parseFloat(cat.percentage) > 10).length}
              </div>
              <div className="text-sm text-yellow-600 font-medium">Major Categories</div>
              <div className="text-xs text-yellow-500 mt-1">
                {'>'} 10% of total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryBreakdown
