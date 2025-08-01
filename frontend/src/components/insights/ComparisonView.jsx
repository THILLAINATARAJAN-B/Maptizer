import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Star, 
  Target,
  Award,
  Search,
  ArrowUpDown,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'

// ✅ UPDATED Component Signature and Order:
const ComparisonView = ({ comparison, loading = false }) => {
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [showDetails, setShowDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ FIRST: Check loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900">Loading Comparison...</h3>
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Analyzing similarities...</p>
        </div>
      </div>
    )
  }

  // ✅ SECOND: Check if comparison exists
  if (!comparison) return null

  const results = comparison.results || []

  // ✅ THIRD: Check if results exist
  if (!Array.isArray(results) || results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900">Comparison Results</h3>
        </div>
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No comparison data available</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Unable to find comparable attributes between the selected entities. 
            Try comparing different locations or check if the entities have sufficient data.
          </p>
        </div>
      </div>
    )
  }

  // Get unique categories for filtering
  const categories = ['all', ...new Set(results.map(item => {
    try {
      return item.subtype?.split(':')[2] || 'other'
    } catch (error) {
      console.warn('Error processing category for item:', item)
      return 'other'
    }
  }))]

  // Filter and sort results
  const filteredResults = results
    .filter(item => {
      const matchesCategory = filterCategory === 'all' || (item.subtype?.split(':')[2] || 'other') === filterCategory
      const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0)
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced Controls Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Comparison Controls
              </h3>
              <p className="text-sm text-gray-600 mt-1">Filter and sort comparison results</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>{filteredResults.length} of {results.length} results</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              {/* ✅ Enhanced Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search similarities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 min-w-[200px]"
                />
              </div>
              
              {/* ✅ Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* ✅ Sort Options */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm"
                >
                  <option value="score">Match Score</option>
                  <option value="popularity">Popularity</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            
            {/* ✅ View Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Results Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-orange-600" />
            Similarity Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">Detailed comparison results with match scores</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
            {filteredResults.map((item, index) => (
              <ComparisonItem 
                key={`${item.entity_id}-${index}`} 
                item={item} 
                rank={index + 1}
                showDetails={showDetails}
              />
            ))}
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-orange-300" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h4>
              <p className="text-gray-600">
                Try adjusting your search term or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ComparisonItem = ({ item, rank, showDetails }) => {
  const score = item.score || 0
  const popularity = item.popularity || 0
  const category = item.subtype?.split(':')[2] || 'other'
  
  const getScoreColor = (score) => {
    if (score > 0.8) return 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
    if (score > 0.6) return 'text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200'
    if (score > 0.4) return 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200'
    return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-200'
  }

  const getScoreIcon = (score) => {
    if (score > 0.7) return <Award className="w-4 h-4" />
    if (score > 0.5) return <TrendingUp className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  return (
    <div className="comparison-item group p-6 border border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
              {rank}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h4>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-medium capitalize border">
                  {category.replace('_', ' ')}
                </span>
                {item.type && (
                  <span className="text-xs text-gray-500 font-medium">{item.type}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${getScoreColor(score)}`}>
              {getScoreIcon(score)}
              <span className="text-lg font-bold">
                {(score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Match Score</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
              <Star className="w-4 h-4" />
              <span className="text-lg font-bold">
                {(popularity * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Popularity</div>
          </div>
        </div>
      </div>
      
      {/* ✅ Enhanced Visual Score Bar */}
      <div className="mt-6 flex items-center space-x-4">
        <span className="text-sm text-gray-600 w-20 font-medium">Similarity:</span>
        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner"
            style={{ width: `${score * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-900 w-12 text-right">
          {(score * 100).toFixed(0)}%
        </span>
      </div>

      {/* ✅ Enhanced Details Section */}
      {showDetails && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-semibold text-gray-700">Entity ID:</span>
              <span className="ml-2 text-gray-600 font-mono text-xs">{item.entity_id}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-semibold text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600">{item.type || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-semibold text-gray-700">Subtype:</span>
              <span className="ml-2 text-gray-600">{item.subtype || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-semibold text-gray-700">Raw Score:</span>
              <span className="ml-2 text-gray-600">{score.toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComparisonView
