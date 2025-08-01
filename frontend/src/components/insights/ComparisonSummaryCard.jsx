import React from 'react'
import { 
  Award, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Star
} from 'lucide-react'

const ComparisonSummaryCard = ({ summary }) => {
  if (!summary) return null

  const getQualityConfig = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'excellent': 
        return { 
          color: 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200',
          icon: CheckCircle,
          bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50'
        }
      case 'good': 
        return { 
          color: 'text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200',
          icon: CheckCircle,
          bgClass: 'bg-gradient-to-br from-blue-50 to-indigo-50'
        }
      case 'fair': 
        return { 
          color: 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200',
          icon: AlertCircle,
          bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50'
        }
      case 'poor': 
        return { 
          color: 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-200',
          icon: XCircle,
          bgClass: 'bg-gradient-to-br from-red-50 to-pink-50'
        }
      default: 
        return { 
          color: 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200',
          icon: BarChart3,
          bgClass: 'bg-gradient-to-br from-gray-50 to-slate-50'
        }
    }
  }

  const qualityConfig = getQualityConfig(summary.comparison_quality)
  const QualityIcon = qualityConfig.icon

  const summaryCards = [
    {
      title: 'Total Similarities',
      value: summary.tags_found || 0,
      icon: Target,
      gradient: 'from-orange-500 to-red-600',
      bgClass: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200',
      description: 'Matching attributes found'
    },
    {
      title: 'Match Quality',
      value: summary.comparison_quality || 'Unknown',
      icon: QualityIcon,
      gradient: 'from-blue-500 to-indigo-600',
      bgClass: qualityConfig.bgClass + ' border',
      description: 'Overall comparison rating'
    },
    {
      title: 'High Matches',
      value: summary.high_score_count || 0,
      icon: Award,
      gradient: 'from-green-500 to-emerald-600',
      bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
      description: 'Strong similarities (>70%)'
    },
    {
      title: 'Categories',
      value: summary.categories || 0,
      icon: BarChart3,
      gradient: 'from-purple-500 to-violet-600',
      bgClass: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
      description: 'Different similarity types'
    },
    {
      title: 'Average Score',
      value: `${((summary.average_score || 0) * 100).toFixed(0)}%`,
      icon: TrendingUp,
      gradient: 'from-yellow-500 to-orange-500',
      bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
      description: 'Mean similarity strength'
    },
    {
      title: 'Meaningful',
      value: summary.has_meaningful_comparison ? 'Yes' : 'No',
      icon: Zap,
      gradient: summary.has_meaningful_comparison ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600',
      bgClass: summary.has_meaningful_comparison 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
      description: 'Comparison significance'
    }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      {/* ✅ Apple-Style Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-orange-600" />
              Comparison Overview
            </h3>
            <p className="text-sm text-gray-600 mt-1">Comprehensive analysis summary</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold border ${qualityConfig.color}`}>
            <QualityIcon className="w-4 h-4 inline mr-2" />
            {summary.comparison_quality || 'Unknown'} Match
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ✅ Enhanced Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className={`group p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg ${card.bgClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {card.title}
                </div>
                <div className="text-xs text-gray-500">
                  {card.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* ✅ Enhanced Top Similarities Preview */}
        {summary.top_similarities && summary.top_similarities.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-yellow-600" />
              <h4 className="text-lg font-semibold text-gray-900">Top Similarities</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.top_similarities.map((similarity, index) => (
                <div key={index} className="group p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 text-sm leading-tight">{similarity.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-bold">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                    <div className="text-center">
                      <div className="font-bold text-orange-700">{(similarity.score * 100).toFixed(1)}%</div>
                      <div>Score</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-700">{(similarity.popularity * 100).toFixed(1)}%</div>
                      <div>Pop</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-700 capitalize">{similarity.category}</div>
                      <div>Type</div>
                    </div>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${similarity.score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Enhanced Category Distribution */}
        {summary.category_distribution && Object.keys(summary.category_distribution).length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Category Distribution</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-300 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(summary.category_distribution).map(([category, count]) => (
                <div key={category} className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 hover:shadow-md transition-shadow duration-300">
                  <div className="text-2xl font-bold text-purple-700 mb-1">{count}</div>
                  <div className="text-xs text-purple-600 capitalize font-medium">
                    {category.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparisonSummaryCard
