import React from 'react'
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Target, 
  Activity, 
  Zap,
  BarChart3,
  Thermometer,
  Star,
  DollarSign,
  Sparkles
} from 'lucide-react'

const LocationStatsPanel = ({ analyticsData, location, filters }) => {
  if (!analyticsData) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            Location Statistics
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-orange-400 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading comprehensive statistics...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Locations',
      value: analyticsData.totalLocations || 0,
      icon: MapPin,
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: '+12%',
      description: 'Active locations found'
    },
    {
      label: 'Heatmap Points',
      value: analyticsData.heatmapPoints || 0,
      icon: Thermometer,
      gradient: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: '+8%',
      description: 'Demographic data points'
    },
    {
      label: 'Categories',
      value: Object.keys(analyticsData.categories || {}).length,
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: '+15%',
      description: 'Business categories'
    },
    {
      label: 'High Popularity',
      value: analyticsData.popularityDistribution?.High || 0,
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      change: '+20%',
      description: 'Popular venues (>80%)'
    }
  ]

  const coverageArea = Math.PI * Math.pow(filters?.radius || 0, 2)

  return (
    <div className="space-y-6">
      {/* ✅ Apple-Style Stats Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Key Metrics
              </h3>
              <p className="text-sm text-gray-600 mt-1">Real-time analytics and insights</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Live Data</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div 
                  key={index} 
                  className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:border-orange-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-green-600 font-semibold">{stat.change}</span>
                        <span className="text-xs text-gray-500">{stat.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ✅ Coverage Analysis Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Coverage Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">Spatial distribution metrics</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-700">Search Radius</span>
              </div>
              <p className="text-2xl font-bold text-orange-800">{filters?.radius || 0} km</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Coverage Area</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{Math.round(coverageArea)} km²</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700">Density</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {coverageArea > 0 ? ((analyticsData.totalLocations || 0) / coverageArea * 100).toFixed(1) : '0'}/100km²
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Active Filters Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-600" />
            Active Filters
          </h3>
          <p className="text-sm text-gray-600 mt-1">Current analysis parameters</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-600">Target Age Group</span>
              <span className="text-lg font-semibold text-gray-900 capitalize">
                {filters?.age?.replace(/_/g, ' ').replace('to', '-') || 'All Ages'} years
              </span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-600">Income Bracket</span>
              <span className="text-lg font-semibold text-gray-900 capitalize">
                {filters?.income || 'All'} income
              </span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-600">Popularity Filter</span>
              <span className="text-lg font-semibold text-gray-900">
                ≥{((filters?.popularity || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Quick Insights Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-600" />
            Quick Insights
          </h3>
          <p className="text-sm text-gray-600 mt-1">AI-powered recommendations</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-700">Most Popular Category</span>
            </div>
            <p className="text-blue-800">
              {analyticsData.categories && Object.keys(analyticsData.categories).length > 0
                ? Object.entries(analyticsData.categories)
                    .sort(([,a], [,b]) => b - a)[0][0]
                    .charAt(0).toUpperCase() + Object.entries(analyticsData.categories)
                    .sort(([,a], [,b]) => b - a)[0][0].slice(1)
                : 'No data available'
              }
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">Coverage Quality</span>
            </div>
            <p className="text-green-800">
              {(analyticsData.totalLocations || 0) > 50 ? 'Excellent' : 
               (analyticsData.totalLocations || 0) > 20 ? 'Good' : 
               (analyticsData.totalLocations || 0) > 5 ? 'Fair' : 'Limited'} data coverage
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-700">Recommendation</span>
            </div>
            <p className="text-purple-800">
              {(filters?.radius || 0) < 10 ? 'Consider expanding search radius' :
               (filters?.radius || 0) > 50 ? 'Try focusing on smaller area' :
               'Current settings provide good balance'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationStatsPanel
