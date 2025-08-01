import React, { useState } from 'react'
import html2canvas from 'html2canvas' // Add this dependency: npm install html2canvas
import { useApi } from '../../hooks/useApi' // Add this import
import { useLocation } from 'react-router-dom'
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
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Activity, 
  Target, 
  Radar as RadarIcon,
  Sparkles,
  ArrowRight,
  Zap,
  Camera,
  Download,
  ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

// ✅ Chart Capture Button Component
const ChartCaptureButton = ({ targetId, chartType, saving, onCapture }) => (
  <button
    onClick={() => onCapture(targetId, chartType)}
    disabled={saving}
    className={`absolute top-3 right-3 z-10 flex items-center space-x-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 ${
      saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
    }`}
    title="Save chart as image"
  >
    {saving ? (
      <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
    ) : (
      <Camera className="w-4 h-4 text-orange-600" />
    )}
    <span className="text-xs font-medium text-gray-700 hidden sm:inline">
      {saving ? 'Saving...' : 'Capture'}
    </span>
  </button>
)

const EnhancedAnalyticsChart = ({ combinedData = [], heatmapData = [], analyticsData, filters }) => {
  const [chartType, setChartType] = useState('overview')
  const [saving, setSaving] = useState(false)

  // ✅ REMOVE the useApi line - it's not needed here
  
  // ✅ Enhanced chart capture functionality
  const handleCaptureChart = async (targetId, chartType) => {
    setSaving(true)
    const toastId = toast.loading('Capturing chart...')
    
    try {
      const element = document.getElementById(targetId)
      if (!element) {
        throw new Error('Chart element not found')
      }

      // ✅ Enhanced capture options for better quality
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      })

      const imageBase64 = canvas.toDataURL('image/png', 1.0)
      
      // ✅ FIXED: Use proper API URL
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/save-chart-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          chartType,
          chartId: targetId,
          metadata: {
            location: analyticsData?.location || 'Unknown',
            filters,
            timestamp: new Date().toISOString(),
            totalLocations: analyticsData?.totalLocations || 0,
            categories: Object.keys(analyticsData?.categories || {}).length
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Chart image saved successfully!', { id: toastId })
      } else {
        throw new Error(result.error || 'Failed to save image')
      }
    } catch (error) {
      console.error('Error capturing chart:', error)
      toast.error('Failed to capture chart image', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (!analyticsData || combinedData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
            Enhanced Analytics
          </h3>
        </div>
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-transparent border-r-orange-400 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 max-w-md mx-auto">Load location data to see comprehensive analytics and visualizations with advanced insights.</p>
        </div>
      </div>
    )
  }

  // ✅ Prepare comprehensive chart data with enhanced formatting
  const categoryData = Object.entries(analyticsData.categories || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: (((value || 0) / (analyticsData.totalLocations || 1)) * 100).toFixed(1)
  }))

  const popularityData = Object.entries(analyticsData.popularityDistribution || {}).map(([name, value]) => ({
    name,
    value,
    percentage: (((value || 0) / (analyticsData.totalLocations || 1)) * 100).toFixed(1)
  }))

  const ratingData = Object.entries(analyticsData.ratings || {}).map(([name, value]) => ({
    name: name.replace('-', ' to '),
    value,
    percentage: (((value || 0) / (analyticsData.totalLocations || 1)) * 100).toFixed(1)
  }))

  // ✅ Enhanced location distribution calculation
  const locationDistribution = combinedData.map((item, index) => {
    const centerLat = analyticsData.geographicSpread?.latRange ? 
      (analyticsData.geographicSpread.latRange.min + analyticsData.geographicSpread.latRange.max) / 2 : 0
    const centerLng = analyticsData.geographicSpread?.lngRange ? 
      (analyticsData.geographicSpread.lngRange.min + analyticsData.geographicSpread.lngRange.max) / 2 : 0
    const distance = Math.sqrt(Math.pow((item.lat || 0) - centerLat, 2) + Math.pow((item.lng || 0) - centerLng, 2)) * 111
    
    return {
      name: item.name?.substring(0, 20) || `Location ${index + 1}`,
      distance: distance.toFixed(1),
      popularity: ((item.popularity || 0) * 100).toFixed(1),
      rating: item.rating || 0,
      category: item.category || 'Other'
    }
  }).sort((a, b) => a.distance - b.distance).slice(0, 15)

  // ✅ Enhanced color palette with orange theme
  const COLORS = [
    '#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', 
    '#ec4899', '#14b8a6', '#eab308', '#06b6d4', '#84cc16'
  ]

  const chartTypes = [
    { 
      type: 'overview', 
      icon: BarChart3, 
      label: 'Overview', 
      gradient: 'from-orange-500 to-red-600',
      description: 'Complete dashboard view'
    },
    { 
      type: 'categories', 
      icon: PieIcon, 
      label: 'Categories', 
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Category breakdown'
    },
    { 
      type: 'popularity', 
      icon: TrendingUp, 
      label: 'Popularity', 
      gradient: 'from-green-500 to-emerald-600',
      description: 'Popularity analysis'
    },
    { 
      type: 'ratings', 
      icon: Activity, 
      label: 'Ratings', 
      gradient: 'from-purple-500 to-violet-600',
      description: 'Rating distribution'
    },
    { 
      type: 'scatter', 
      icon: Target, 
      label: 'Scatter', 
      gradient: 'from-pink-500 to-rose-600',
      description: 'Distance vs Popularity'
    },
    { 
      type: 'radar', 
      icon: RadarIcon, 
      label: 'Radar', 
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Multi-dimensional view'
    }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold ml-2" style={{ color: entry.color }}>
                {entry.value}
                {entry.payload?.percentage && ` (${entry.payload.percentage}%)`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      {/* ✅ Apple-Style Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-orange-600" />
              Advanced Analytics Visualization
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive insights from <span className="font-semibold text-orange-600">{analyticsData.totalLocations || 0}</span> locations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Interactive Charts</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>Capture Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Apple-Style Chart Type Selector */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl">
          {chartTypes.map((chart) => {
            const Icon = chart.icon
            const isActive = chartType === chart.type
            return (
              <button
                key={chart.type}
                onClick={() => setChartType(chart.type)}
                className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
                title={chart.description}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${chart.gradient}` 
                    : 'bg-gray-200 group-hover:bg-gray-300'
                }`}>
                  <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className="hidden sm:inline">{chart.label}</span>
                {isActive && (
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ✅ Enhanced Chart Container with Better Spacing */}
      <div className="p-8"> {/* Increased padding from p-6 to p-8 */}
        <div className="space-y-10"> {/* Increased spacing from space-y-6 to space-y-10 */}
          {chartType === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Increased gap from gap-6 to gap-8 */}
              {/* Category Distribution */}
              <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-6" id="category-distribution-chart">
                <ChartCaptureButton 
                  targetId="category-distribution-chart" 
                  chartType="category-distribution" 
                  saving={saving}
                  onCapture={handleCaptureChart}
                />
                <h4 className="text-lg font-semibold mb-6 text-orange-800 flex items-center">
                  <PieIcon className="w-5 h-5 mr-2" />
                  Category Distribution
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popularity Distribution */}
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6" id="popularity-distribution-chart">
                <ChartCaptureButton 
                  targetId="popularity-distribution-chart" 
                  chartType="popularity-distribution" 
                  saving={saving}
                  onCapture={handleCaptureChart}
                />
                <h4 className="text-lg font-semibold mb-6 text-blue-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Popularity Distribution
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularityData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1e40af' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#1e40af' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {chartType === 'categories' && (
            <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-8" id="categories-bar-chart">
              <ChartCaptureButton 
                targetId="categories-bar-chart" 
                chartType="categories-bar" 
                saving={saving}
                onCapture={handleCaptureChart}
              />
              <div className="h-96" data-chart="analytics-visualization">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#categoryGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartType === 'popularity' && (
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8" id="popularity-area-chart">
              <ChartCaptureButton 
                targetId="popularity-area-chart" 
                chartType="popularity-area" 
                saving={saving}
                onCapture={handleCaptureChart}
              />
              <div className="h-96" data-chart="analytics-visualization">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={locationDistribution}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#065f46' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12, fill: '#065f46' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="popularity" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#areaGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartType === 'ratings' && ratingData.length > 0 && (
            <div className="relative bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 mb-8" id="ratings-bar-chart">
              <ChartCaptureButton 
                targetId="ratings-bar-chart" 
                chartType="ratings-bar" 
                saving={saving}
                onCapture={handleCaptureChart}
              />
              <div className="h-96" data-chart="analytics-visualization">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingData}>
                    <defs>
                      <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f0ff" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#581c87' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#581c87' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#ratingGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartType === 'scatter' && (
            <div className="relative bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200 mb-8" id="scatter-chart">
              <ChartCaptureButton 
                targetId="scatter-chart" 
                chartType="scatter" 
                saving={saving}
                onCapture={handleCaptureChart}
              />
              <div className="h-96" data-chart="analytics-visualization">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={locationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis 
                      type="number" 
                      dataKey="distance" 
                      name="Distance (km)"
                      tick={{ fontSize: 12, fill: '#881337' }}
                      label={{ value: 'Distance from Center (km)', position: 'insideBottom', offset: -10, fill: '#881337' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="popularity" 
                      name="Popularity (%)"
                      tick={{ fontSize: 12, fill: '#881337' }}
                      label={{ value: 'Popularity (%)', angle: -90, position: 'insideLeft', fill: '#881337' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter fill="#ec4899" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartType === 'radar' && (
            <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 mb-8" id="radar-chart">
              <ChartCaptureButton 
                targetId="radar-chart" 
                chartType="radar" 
                saving={saving}
                onCapture={handleCaptureChart}
              />
              <div className="h-96" data-chart="analytics-visualization">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={categoryData.slice(0, 6)}>
                    <PolarGrid stroke="#0891b2" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#0e7490' }} />
                    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#0e7490' }} />
                    <Radar
                      name="Locations"
                      dataKey="value"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0891b2' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Enhanced Summary Stats with Better Spacing */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"> {/* Increased margin and gap */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 text-center"> {/* Increased padding */}
            <div className="text-3xl font-bold text-orange-700 mb-2">
              {analyticsData.totalLocations || 0}
            </div>
            <div className="text-sm text-orange-600 font-medium">Total Locations</div>
            <div className="text-xs text-orange-500 mt-2">Active venues</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {Object.keys(analyticsData.categories || {}).length}
            </div>
            <div className="text-sm text-green-600 font-medium">Categories</div>
            <div className="text-xs text-green-500 mt-2">Business types</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 text-center">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {analyticsData.heatmapPoints || 0}
            </div>
            <div className="text-sm text-purple-600 font-medium">Heat Points</div>
            <div className="text-xs text-purple-500 mt-2">Data coverage</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {popularityData.find(p => p.name === 'High')?.value || 0}
            </div>
            <div className="text-sm text-blue-600 font-medium">High Popularity</div>
            <div className="text-xs text-blue-500 mt-2">Premium venues</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAnalyticsChart
