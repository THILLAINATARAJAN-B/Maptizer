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
  ScatterChart, 
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Radar as RadarIcon, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Camera,
  Download
} from 'lucide-react'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const ComparisonChart = ({ data, entityA, entityB }) => {
  const [chartType, setChartType] = useState('bar')
  const [capturing, setCapturing] = useState(false)

  // ✅ Enhanced chart capture functionality
  const handleCaptureChart = async () => {
    setCapturing(true)
    const toastId = toast.loading('Capturing comparison chart...')
    
    try {
      const element = document.getElementById('comparison-chart-capture')
      if (!element) {
        throw new Error('Comparison chart element not found')
      }

      // ✅ Enhanced capture options for better quality
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        ignoreElements: (element) => {
          // Ignore capture button itself
          return element.classList.contains('capture-button')
        }
      })

      const imageBase64 = canvas.toDataURL('image/png', 1.0)
      
      // ✅ Send to backend using your existing API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/save-chart-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          chartType: `comparison-chart-${chartType}`,
          chartId: `comparison-${chartType}-${Date.now()}`,
          metadata: {
            chartType,
            entityA: entityA?.name || 'Unknown Entity A',
            entityB: entityB?.name || 'Unknown Entity B',
            entityAId: entityA?.id,
            entityBId: entityB?.id,
            totalSimilarities: data?.length || 0,
            chartDataPoints: data?.slice(0, 20).length || 0,
            timestamp: new Date().toISOString(),
            captureType: 'comparison-visual-chart',
            categories: Object.keys(data?.reduce((acc, item) => {
              const category = item.subtype?.split(':')[2] || 'other'
              acc[category] = true
              return acc
            }, {}) || {}).length
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`${chartType.toUpperCase()} chart captured successfully!`, { id: toastId })
      } else {
        throw new Error(result.error || 'Failed to save chart image')
      }
    } catch (error) {
      console.error('Error capturing comparison chart:', error)
      toast.error('Failed to capture chart image', { id: toastId })
    } finally {
      setCapturing(false)
    }
  }

  if (!data || data.length === 0) return null

  // Prepare data for different chart types
  const chartData = data.slice(0, 20).map((item, index) => ({
    id: index,
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    score: (item.score || 0) * 100,
    popularity: (item.popularity || 0) * 100,
    category: item.subtype?.split(':')[2] || 'other',
    rank: index + 1
  }))

  // Group data by category for pie chart
  const categoryData = data.reduce((acc, item) => {
    const category = item.subtype?.split(':')[2] || 'other'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(categoryData).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    percentage: ((value / data.length) * 100).toFixed(1)
  }))

  // Radar chart data for top categories
  const topCategories = Object.entries(categoryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([category, count]) => ({
      category: category.replace('_', ' ').toUpperCase(),
      value: count,
      fullMark: Math.max(...Object.values(categoryData))
    }))

  const COLORS = [
    '#f97316', '#ef4444', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#eab308',
    '#06b6d4', '#84cc16'
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{data?.fullName || label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-semibold ml-2" style={{ color: entry.color }}>
                {entry.value?.toFixed(1)}%
              </span>
            </div>
          ))}
          {data?.category && (
            <p className="text-xs text-gray-500 mt-2 capitalize">
              Category: {data.category.replace('_', ' ')}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const charts = [
    { type: 'bar', icon: BarChart3, label: 'Bar Chart', gradient: 'from-orange-500 to-red-600' },
    { type: 'pie', icon: PieChartIcon, label: 'Categories', gradient: 'from-blue-500 to-indigo-600' },
    { type: 'scatter', icon: Activity, label: 'Score vs Pop', gradient: 'from-green-500 to-emerald-600' },
    { type: 'radar', icon: RadarIcon, label: 'Radar View', gradient: 'from-purple-500 to-violet-600' },
    { type: 'line', icon: TrendingUp, label: 'Trend Line', gradient: 'from-pink-500 to-rose-600' }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg" id="comparison-chart-capture">
      {/* ✅ Apple-Style Header with Capture Button */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-orange-600" />
              Comparison Visualization
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">{entityA?.name}</span>
              <ArrowRight className="w-3 h-3 inline mx-2 text-orange-500" />
              <span className="font-medium text-purple-600">{entityB?.name}</span>
              <span className="ml-2">• {data.length} similarities found</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* ✅ Chart Type Selector */}
            <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
              {charts.map((chart) => {
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
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${chart.gradient}` 
                        : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}>
                      <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className="hidden sm:inline">{chart.label}</span>
                  </button>
                )
              })}
            </div>

            {/* ✅ Capture Button */}
            <button
              onClick={handleCaptureChart}
              disabled={capturing}
              className={`capture-button flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
                capturing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              title={`Capture ${chartType} chart as image`}
            >
              {capturing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {capturing ? 'Capturing...' : 'Capture Chart'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Chart Container */}
      <div className="p-6">
        <div className="h-96 mb-6" data-chart="comparison-visualization">
          <ResponsiveContainer width="100%" height="100%">
            {/* Bar Chart */}
            {chartType === 'bar' && (
              <BarChart data={chartData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="popularityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="url(#scoreGradient)" radius={[4, 4, 0, 0]} name="Match Score" />
                <Bar dataKey="popularity" fill="url(#popularityGradient)" radius={[4, 4, 0, 0]} name="Popularity" />
              </BarChart>
            )}

            {/* Pie Chart */}
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={140}
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

            {/* Scatter Chart */}
            {chartType === 'scatter' && (
              <ScatterChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  type="number" 
                  dataKey="score" 
                  name="Match Score"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Match Score (%)', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="popularity" 
                  name="Popularity"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Popularity (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter fill="#10b981" />
              </ScatterChart>
            )}

            {/* Radar Chart */}
            {chartType === 'radar' && topCategories.length > 0 && (
              <RadarChart data={topCategories}>
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Radar
                  name="Similarities"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed' }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            )}

            {/* Line Chart */}
            {chartType === 'line' && (
              <LineChart data={chartData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="rank" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ea580c' }}
                  name="Match Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="popularity" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#059669' }}
                  name="Popularity"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ✅ Enhanced Chart Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 text-center">
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {Math.max(...chartData.map(d => d.score)).toFixed(1)}%
            </div>
            <div className="text-sm text-orange-600 font-medium">Highest Match</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {(chartData.reduce((sum, d) => sum + d.score, 0) / (chartData.length || 1)).toFixed(1)}%
            </div>
            <div className="text-sm text-green-600 font-medium">Average Match</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 text-center">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {Object.keys(categoryData).length}
            </div>
            <div className="text-sm text-purple-600 font-medium">Categories</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {chartData.filter(d => d.score > 70).length}
            </div>
            <div className="text-sm text-blue-600 font-medium">Strong Matches</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonChart
