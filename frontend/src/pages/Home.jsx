import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  TrendingUp, 
  GitCompare, 
  BarChart3, 
  MapPin, 
  Zap, 
  Activity,
  Users,
  Globe,
  Target,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import { formatCombinedData } from '../services/dataService'
import Dashboard from '../components/dashboard/Dashboard'
import SearchMap from '../components/maps/SearchMap'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

const Home = () => {
  const navigate = useNavigate()
  const { selectedLocation, setCombinedData, combinedData } = useApp()
  const { getCombinedData, loading } = useApi()
  const [dashboardStats, setDashboardStats] = useState({
    totalSearches: 0,
    activeLocations: 0,
    comparisons: 0,
    insights: 0
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await getCombinedData({
          location: selectedLocation?.searchName || selectedLocation?.name || 'Washington',
          radius: 15,
          age: '25_to_29',
          income: 'high',
          take: 20
        })
        
        const formattedData = formatCombinedData(response)
        setCombinedData(formattedData)
        
        setDashboardStats({
          totalSearches: 12847 + Math.floor(Math.random() * 100),
          activeLocations: formattedData.length,
          comparisons: 892 + Math.floor(Math.random() * 50),
          insights: 2341 + Math.floor(Math.random() * 200)
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setCombinedData([])
      }
    }

    loadDashboardData()
  }, [selectedLocation])

  const stats = [
    {
      title: "Total Searches",
      value: dashboardStats.totalSearches,
      change: 12.5,
      changeType: "increase",
      icon: Search,
      color: "primary",
      subtitle: "This month"
    },
    {
      title: "Active Locations",
      value: dashboardStats.activeLocations,
      change: 8.2,
      changeType: "increase",
      icon: MapPin,
      color: "success",
      subtitle: "Live data"
    },
    {
      title: "Comparisons Made",
      value: dashboardStats.comparisons,
      change: -2.4,
      changeType: "decrease",
      icon: GitCompare,
      color: "info",
      subtitle: "AI powered"
    },
    {
      title: "Insights Generated",
      value: dashboardStats.insights,
      change: 15.8,
      changeType: "increase",
      icon: Sparkles,
      color: "warning",
      subtitle: "Auto-generated"
    }
  ]

  const recentActivity = [
    {
      title: "New search: Coffee shops in Mumbai",
      description: "Found 156 locations with analytics data",
      time: "2 min ago",
      status: "completed",
      type: "search",
      metadata: { locations: 156, accuracy: 94 }
    },
    {
      title: "Location comparison generated",
      description: "Starbucks vs Cafe Coffee Day analysis",
      time: "15 min ago",
      status: "completed",
      type: "comparison",
      metadata: { accuracy: 87 }
    },
    {
      title: "Heatmap analysis requested",
      description: "Demographics for Bangalore tech parks",
      time: "1 hour ago",
      status: "processing",
      type: "heatmap",
      metadata: { locations: 45 }
    },
    {
      title: "AI summary generated",
      description: "Restaurant trends in Delhi NCR",
      time: "2 hours ago",
      status: "completed",
      type: "summary",
      metadata: { accuracy: 92 }
    }
  ]

  const quickActions = [
    {
      title: "Search Locations",
      description: "Find places with demographic insights",
      icon: Search,
      onClick: () => navigate('/search'),
      color: "primary",
      badge: "Popular"
    },
    {
      title: "View Analytics", 
      description: "Comprehensive analytics and heatmaps",
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      color: "success"
    },
    {
      title: "Compare Places",
      description: "AI-powered location comparison",
      icon: GitCompare,
      onClick: () => navigate('/compare'),
      color: "info",
      badge: "New"
    },
    {
      title: "Generate Insights",
      description: "Discover trends and patterns",
      icon: TrendingUp,
      onClick: () => navigate('/insights'),
      color: "purple"
    }
  ]

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Search for places with demographic insights and popularity metrics',
      link: '/search',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: '10K+ searches',
      isNew: false
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics with real-time data visualization',
      link: '/analytics',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: '500+ reports',
      isNew: true
    },
    {
      icon: GitCompare,
      title: 'AI Comparison',
      description: 'Compare entities and generate AI-powered summaries with GROQ',
      link: '/compare',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: '1K+ comparisons',
      isNew: false
    },
    {
      icon: BarChart3,
      title: 'Heatmap Insights',
      description: 'Visualize demographic data and location trends',
      link: '/heatmap',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      stats: '200+ heatmaps',
      isNew: false
    }
  ]

  const safeData = Array.isArray(combinedData) ? combinedData : []

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Reduced top padding and optimized container spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ✅ Apple-style Hero Section - Reduced spacing */}
        <section className="pt-8 pb-16 text-center">
          <div className="space-y-6">
            {/* Badge section */}
            <div className="flex justify-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ✨ Industry-Grade Platform
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🚀 AI-Powered
              </span>
            </div>
            
            {/* Main heading - Tighter spacing */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-none">
                Maptizer
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-600 leading-tight">
                Analytics Platform
              </h2>
            </div>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
              Unlock location intelligence with demographic insights, popularity metrics, 
              and AI-powered trend analysis.
            </p>

            {/* Status indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-500 pt-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Currently viewing: {selectedLocation?.name || 'Global'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>{safeData.length} active locations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Dashboard Section - Perfect spacing */}
        <section className="pb-20">
          <Dashboard 
            stats={stats}
            recentActivity={recentActivity}
            quickActions={quickActions}
          />
        </section>

        {/* ✅ Features Section - Optimized Apple-style spacing */}
        <section className="pb-20">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive analytics suite designed for professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group block"
              >
                <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-gray-300 transition-all duration-500 hover:-translate-y-1">
                  <div className="space-y-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {feature.title}
                        </h3>
                        {feature.isNew && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-medium text-orange-600">
                          {feature.stats}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ✅ Map Section - Perfect Apple-style spacing */}
        <section className="pb-20">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Location Overview
            </h2>
            <p className="text-xl text-gray-600">
              Interactive map showing current location data
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
            {/* Map header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-gray-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Live Map Data</h3>
                    <p className="text-sm text-gray-600">Real-time location intelligence</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">Focus</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Map container */}
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 animate-spin text-orange-600" />
                    <span className="text-gray-700 font-medium">Loading locations...</span>
                  </div>
                </div>
              )}
              <SearchMap 
                data={safeData}
                center={[selectedLocation?.lat || 40.7128, selectedLocation?.lng || -74.0060]}
                zoom={13}
                height="500px"
              />
            </div>

            {/* Map footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="font-medium">Showing {safeData.length} locations</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <Link to="/search">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    <span className="text-sm font-medium">View detailed search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
