import React from 'react'
import { MapPin, Users, TrendingUp, Target, Activity, Zap } from 'lucide-react'

const LocationStatsPanel = ({ analyticsData, location, filters }) => {
  // ✅ Enhanced data validation
  const data = analyticsData || {}
  
  // ✅ Calculate dynamic changes
  const calculateChange = (current, baseline = 100) => {
    if (!current || current === 0) return '0%'
    const change = ((current - baseline) / baseline) * 100
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  const stats = [
    {
      label: 'Total Locations',
      value: data.totalLocations || 0,
      icon: MapPin,
      color: 'text-blue-600 bg-blue-100',
      change: calculateChange(data.totalLocations, 50)
    },
    {
      label: 'Heatmap Points',
      value: data.heatmapPoints || 0,
      icon: Activity,
      color: 'text-red-600 bg-red-100',
      change: calculateChange(data.heatmapPoints, 30)
    },
    {
      label: 'Categories',
      value: Object.keys(data.categories || {}).length,
      icon: Target,
      color: 'text-green-600 bg-green-100',
      change: calculateChange(Object.keys(data.categories || {}).length, 5)
    },
    {
      label: 'Top Category',
      value: data.topCategory || 'N/A',
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
      change: data.topCategory ? '+20%' : '0%'
    }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Location Statistics
            </h3>
            <p className="text-sm text-gray-600 mt-1">Key metrics and performance indicators</p>
          </div>
          <div className="text-xs text-gray-500">
            📍 {location?.name || 'Current Location'}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                    stat.change.startsWith('+') 
                      ? 'text-green-700 bg-green-100' 
                      : stat.change.startsWith('-')
                      ? 'text-red-700 bg-red-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ✅ Enhanced Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-orange-500" />
            Current Analysis Parameters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
              <div className="text-xs text-orange-600 font-medium">Age Group</div>
              <div className="text-sm font-bold text-orange-800">
                {filters?.age?.replace(/_/g, '-') || 'All Ages'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-green-600 font-medium">Income Level</div>
              <div className="text-sm font-bold text-green-800 capitalize">
                {filters?.income || 'All'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">Search Radius</div>
              <div className="text-sm font-bold text-blue-800">
                {filters?.radius || 25}km
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationStatsPanel
