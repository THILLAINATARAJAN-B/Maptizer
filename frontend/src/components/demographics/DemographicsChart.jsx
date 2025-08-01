import React, { useRef, useState } from 'react'
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
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { formatChartData } from '../../services/dataService'
import { 
  Users, 
  Sparkles, 
  Camera, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon,
  ArrowUpRight,
  Info
} from 'lucide-react'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const COLORS = [
  '#f97316', '#ef4444', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'
]

const DemographicsChart = ({ data, title, type = 'age', showCapture = true, compact = false }) => {
  const [chartType, setChartType] = useState('bar')
  const [isCapturing, setIsCapturing] = useState(false)
  const chartRef = useRef(null)

  // ✅ **Enhanced**: Capture chart as image
  const captureChart = async () => {
    if (!chartRef.current) {
      toast.error('Chart not loaded yet')
      return
    }

    setIsCapturing(true)
    const toastId = toast.loading('Capturing demographics chart...')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2,
        width: chartRef.current.offsetWidth,
        height: chartRef.current.offsetHeight,
        backgroundColor: '#ffffff'
      })

      const base64Image = canvas.toDataURL('image/png', 0.9)
      
      if (!data || Object.keys(data).length === 0) {
        toast.error('No data to capture', { id: toastId })
        return
      }

      const chartData = formatChartData({ [type]: data }, type)
      const metadata = {
        timestamp: new Date().toISOString(),
        chartType: `demographics-${type}-${chartType}`,
        dataPoints: chartData.length,
        totalValue: chartData.reduce((sum, item) => sum + item.value, 0),
        title: title,
        demographicType: type,
        visualType: chartType
      }

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseURL}/save-chart-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          chartType: `demographics-${type}`,
          chartId: `demo_${type}_${Date.now()}`,
          metadata: metadata
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Demographics chart captured successfully!', { id: toastId })
      } else {
        throw new Error(result.error || 'Failed to save chart')
      }

    } catch (error) {
      console.error('Capture error:', error)
      toast.error(`Failed to capture chart: ${error.message}`, { id: toastId })
    } finally {
      setIsCapturing(false)
    }
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-orange-600" />
            {title}
          </h3>
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-3 text-orange-300" />
          <p className="text-gray-600 text-sm">No demographic data available</p>
        </div>
      </div>
    )
  }

  const chartData = formatChartData({ [type]: data }, type)

  // ✅ Enhanced tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl border-l-4 border-l-orange-500">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Count:</span>
              <span className="font-semibold text-gray-900">{payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-semibold text-orange-600">{data.percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0)
  const maxValue = Math.max(...chartData.map(item => item.value))
  const avgValue = totalCount / chartData.length

  return (
    <div ref={chartRef} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* ✅ Enhanced Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {chartData.length} categories • {totalCount.toLocaleString()} entries
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-white shadow text-orange-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Bar Chart"
              >
                <BarChart3 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-1.5 rounded transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-white shadow text-orange-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Pie Chart"
              >
                <PieIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded transition-colors ${
                  chartType === 'area' 
                    ? 'bg-white shadow text-orange-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Area Chart"
              >
                <TrendingUp className="w-3 h-3" />
              </button>
            </div>

            {/* Capture Button */}
            {showCapture && (
              <button
                onClick={captureChart}
                disabled={isCapturing}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isCapturing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title="Capture chart as image"
              >
                {isCapturing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3 h-3" />
                    <span>Capture</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ✅ Compact Stats Row */}
        {!compact && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-lg font-bold text-orange-600">{totalCount.toLocaleString()}</div>
              <div className="text-xs text-gray-600 font-medium">Total</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-lg font-bold text-blue-600">{maxValue.toLocaleString()}</div>
              <div className="text-xs text-gray-600 font-medium">Highest</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="text-lg font-bold text-purple-600">{Math.round(avgValue).toLocaleString()}</div>
              <div className="text-xs text-gray-600 font-medium">Average</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* ✅ Dynamic Chart Display */}
        <div className={compact ? "h-48 mb-4" : "h-64 mb-6"}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id={`demographicGradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={`url(#demographicGradient-${type})`} 
                  radius={[6, 6, 0, 0]}
                  stroke="#ea580c"
                  strokeWidth={1}
                />
              </BarChart>
            ) : chartType === 'pie' ? (
              <PieChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={compact ? 40 : 50}
                  outerRadius={compact ? 80 : 100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                />
              </PieChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id={`areaGradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fill={`url(#areaGradient-${type})`} 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ✅ Enhanced Data Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 flex items-center mb-3 text-sm">
            <ArrowUpRight className="w-3 h-3 mr-2 text-orange-600" />
            Distribution Details
          </h4>
          {chartData.slice(0, compact ? 3 : 5).map((item, index) => (
            <div key={index} className="group hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {item.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Visual progress bar */}
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {item.value.toLocaleString()}
                    </span>
                    <div className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-semibold">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemographicsChart
