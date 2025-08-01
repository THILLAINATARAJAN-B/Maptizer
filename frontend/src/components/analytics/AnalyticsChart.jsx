import React, { useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Activity, Sparkles } from 'lucide-react'

const AnalyticsChart = ({ combinedData = [], heatmapData = [], filters }) => {
  const [chartType, setChartType] = useState('bar')

  // Prepare data for different chart types
  const categoryData = combinedData.reduce((acc, item) => {
    const category = item.category || item.type || 'Other'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const barData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    count: value,
    percentage: ((value / (combinedData.length || 1)) * 100).toFixed(1)
  }))

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    value,
    percentage: ((value / (combinedData.length || 1)) * 100).toFixed(1)
  }))

  // Popularity trend data
  const popularityData = combinedData
    .filter(item => item.popularity !== undefined)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name?.substring(0, 15) || `Item ${index + 1}`,
      popularity: ((item.popularity || 0) * 100).toFixed(1),
      value: item.value || Math.random() * 100
    }))

  const COLORS = ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308']

  const chartTypes = [
    { type: 'bar', icon: BarChart3, label: 'Categories', gradient: 'from-orange-500 to-red-600' },
    { type: 'pie', icon: PieChartIcon, label: 'Distribution', gradient: 'from-blue-500 to-indigo-600' },
    { type: 'line', icon: TrendingUp, label: 'Trends', gradient: 'from-green-500 to-emerald-600' },
    { type: 'area', icon: Activity, label: 'Analysis', gradient: 'from-purple-500 to-violet-600' }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center justify-between" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-semibold ml-2">
                {entry.value}
                {entry.payload?.percentage && ` (${entry.payload.percentage}%)`}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (combinedData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900">Data Visualization</h3>
        </div>
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-orange-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Load analytics data to see charts and visualizations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      {/* ✅ Chart Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-orange-600" />
              Data Visualization
            </h3>
            <p className="text-sm text-gray-600 mt-1">Interactive charts and analytics</p>
          </div>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
            {chartTypes.map((chart) => {
              const Icon = chart.icon
              const isActive = chartType === chart.type
              return (
                <button
                  key={chart.type}
                  onClick={() => setChartType(chart.type)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={chart.label}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? `bg-gradient-to-br ${chart.gradient}` : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className="hidden sm:inline">{chart.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ✅ Chart Container */}
      <div className="p-6">
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' && (
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            )}

            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            )}

            {chartType === 'line' && popularityData.length > 0 && (
              <LineChart data={popularityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="rank" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="popularity" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ea580c' }}
                />
              </LineChart>
            )}

            {chartType === 'area' && popularityData.length > 0 && (
              <AreaChart data={popularityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPopularity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="rank" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="popularity" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPopularity)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ✅ Chart Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{combinedData.length}</div>
            <div className="text-sm text-orange-600 font-medium">Total Locations</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{Object.keys(categoryData).length}</div>
            <div className="text-sm text-green-600 font-medium">Categories</div>
          </div>
          <div className="text-center bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">
              {combinedData.filter(item => (item.popularity || 0) > 0.7).length}
            </div>
            <div className="text-sm text-purple-600 font-medium">High Popularity</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsChart
