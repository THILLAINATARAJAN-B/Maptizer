import React, { useRef, useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  AlertCircle, 
  Activity, 
  Target, 
  Info,
  Camera,
  ArrowUpRight,
  MapPin
} from 'lucide-react'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const DEMOGRAPHIC_COLORS = {
  age: {
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    colors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']
  },
  income: {
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50', 
    borderColor: 'border-green-200',
    colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
  },
  density: {
    gradient: 'from-purple-500 to-violet-600',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
  },
  gender: {
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200',
    colors: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843']
  }
}

const DemographicsPanel = ({ data, filters }) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const panelRef = useRef(null)

  // ✅ **NEW**: Capture panel as image
  const capturePanel = async () => {
    if (!panelRef.current) {
      toast.error('Panel not loaded yet')
      return
    }

    setIsCapturing(true)
    const toastId = toast.loading('Capturing demographics panel...')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(panelRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2,
        width: panelRef.current.offsetWidth,
        height: panelRef.current.offsetHeight,
        backgroundColor: '#ffffff'
      })

      const base64Image = canvas.toDataURL('image/png', 0.9)
      
      const metadata = {
        timestamp: new Date().toISOString(),
        chartType: 'demographics-panel',
        dataPoints: Object.keys(processedData).length,
        title: 'Demographics Overview Panel',
        sections: Object.keys(processedData).filter(key => Object.keys(processedData[key]).length > 0)
      }

      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseURL}/save-chart-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          chartType: 'demographics-panel',
          chartId: `demo_panel_${Date.now()}`,
          metadata: metadata
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Demographics panel captured successfully!', { id: toastId })
      } else {
        throw new Error(result.error || 'Failed to save panel')
      }

    } catch (error) {
      console.error('Capture error:', error)
      toast.error(`Failed to capture panel: ${error.message}`, { id: toastId })
    } finally {
      setIsCapturing(false)
    }
  }

  // ✅ Enhanced data validation
  const processedData = {
    age: data?.age || {},
    income: data?.income || {},
    density: data?.density || {},
    gender: data?.gender || {}
  }

  // ✅ Calculate totals for better insights
  const getTotalEntries = (obj) => {
    return Object.values(obj).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0)
  }

  // ✅ **NEW**: Progress bar component
  const ProgressBar = ({ value, maxValue, color, animated = true }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-1000 ${animated ? 'animate-pulse' : ''}`}
        style={{ 
          width: `${Math.min((value / maxValue) * 100, 100)}%`,
          backgroundColor: color 
        }}
      ></div>
    </div>
  )

  // ✅ **NEW**: Enhanced demographic section renderer
  const DemographicSection = ({ label, dataKey, icon: Icon }) => {
    const sectionData = processedData[dataKey]
    const entries = Object.entries(sectionData).slice(0, 5)
    const config = DEMOGRAPHIC_COLORS[dataKey]
    const total = getTotalEntries(sectionData)
    const maxValue = Math.max(...Object.values(sectionData))
    
    if (entries.length === 0) return null

    return (
      <div className={`bg-gradient-to-br ${config.bgColor} rounded-xl p-4 border ${config.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-600">{entries.length} categories • {total.toLocaleString()} total</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{total.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total entries</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {entries.map(([key, value], index) => (
            <div key={key} className="bg-white/80 rounded-lg p-3 hover:bg-white transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 border border-white shadow-sm"
                    style={{ backgroundColor: config.colors[index % config.colors.length] }}
                  ></div>
                  {key.replace(/[_-]/g, ' ')}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
                  <div className="text-xs text-gray-600">{((value / total) * 100).toFixed(1)}%</div>
                </div>
              </div>
              <ProgressBar 
                value={value} 
                maxValue={maxValue} 
                color={config.colors[index % config.colors.length]}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-orange-600" />
            Demographics Overview
          </h3>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-300" />
          <p className="text-lg font-semibold text-gray-700 mb-2">No demographic data available</p>
          <p className="text-sm text-gray-600">Data will appear here once analysis is complete</p>
        </div>
      </div>
    )
  }

  const activeSections = Object.keys(processedData).filter(key => 
    Object.keys(processedData[key]).length > 0
  )

  return (
    <div ref={panelRef} className="space-y-4">
      {/* ✅ Enhanced Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center">
                <Users className="w-4 h-4 mr-2 text-orange-600" />
                Demographics Overview
              </h3>
              <p className="text-xs text-gray-600 mt-1">{activeSections.length} active data sections</p>
            </div>
            
            {/* ✅ **NEW**: Capture Button */}
            <button
              onClick={capturePanel}
              disabled={isCapturing}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isCapturing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title="Capture panel as image"
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
          </div>
        </div>
        
        {/* ✅ **NEW**: Quick Stats Row */}
        <div className="px-4 py-3 bg-gradient-to-r from-white to-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeSections.map((section) => {
              const total = getTotalEntries(processedData[section])
              const config = DEMOGRAPHIC_COLORS[section]
              
              return (
                <div key={section} className={`bg-gradient-to-br ${config.bgColor} rounded-lg p-2 border ${config.borderColor}`}>
                  <div className="text-lg font-bold text-gray-900">{total.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 font-medium capitalize">{section} entries</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Demographics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DemographicSection 
          label="Age Distribution" 
          dataKey="age" 
          icon={Users}
        />
        
        <DemographicSection 
          label="Income Levels" 
          dataKey="income" 
          icon={TrendingUp}
        />
        
        <DemographicSection 
          label="Population Density" 
          dataKey="density" 
          icon={BarChart3}
        />
        
        {Object.keys(processedData.gender).length > 0 && (
          <DemographicSection 
            label="Gender Distribution" 
            dataKey="gender" 
            icon={Activity}
          />
        )}
      </div>

      {/* ✅ Enhanced Current Filters Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <Target className="w-4 h-4 mr-2 text-orange-600" />
            Current Analysis Parameters
          </h3>
          <p className="text-xs text-gray-600 mt-1">Applied demographic filters and settings</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-3 h-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Target Age</span>
              </div>
              <p className="text-sm font-bold text-orange-800 capitalize">
                {filters?.age?.replace(/_/g, ' ').replace('to', '-') || 'All Ages'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Income Focus</span>
              </div>
              <p className="text-sm font-bold text-green-800 capitalize">
                {filters?.income || 'All'} bracket
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Radius</span>
              </div>
              <p className="text-sm font-bold text-blue-800">
                {filters?.radius || 25}km coverage
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Popularity</span>
              </div>
              <p className="text-sm font-bold text-purple-800">
                {((filters?.popularity || 0.3) * 100).toFixed(0)}% threshold
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemographicsPanel
