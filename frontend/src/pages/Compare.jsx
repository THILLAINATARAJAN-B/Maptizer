import React, { useState, useEffect } from 'react'
import { 
  GitCompare, 
  Search, 
  Zap, 
  Loader2, 
  TrendingUp, 
  BarChart3,
  Award,
  Target,
  Activity,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  Sparkles,
  Clock,
  Eye
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'
import ComparisonView from '../components/insights/ComparisonView'
import { useLocalStorage } from '../hooks/useLocalStorage'
import ComparisonChart from '../components/insights/ComparisonChart'
import EntityComparisonCard from '../components/insights/EntityComparisonCard'
import ComparisonSummaryCard from '../components/insights/ComparisonSummaryCard'
import PDFDownloadButton from '../components/insights/PDFDownloadButton'
import { useNavigate } from 'react-router-dom'

const Compare = () => {
  const navigate = useNavigate() // ✅ ADD THIS LINE
  const { searchResults, comparison, setComparison } = useApp()
  const { compareEntities, generateSummary, loading } = useApi()
  
  const [entityA, setEntityA] = useState('')
  const [entityB, setEntityB] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [comparisonHistory, setComparisonHistory] = useLocalStorage('comparison-history', []);

  // Get available entities from search results
  const availableEntities = searchResults.filter(item => item.id)

  // ✅ Enhanced handleCompare with better error handling
const handleCompare = async () => {
  if (!entityA || !entityB) {
    toast.error('Please select both entities to compare');
    return;
  }

  if (entityA === entityB) {
    toast.error('Please select two different entities');
    return;
  }

  setLocalLoading(true);
  try {
    const response = await compareEntities({
      entity_id_a: entityA,
      entity_id_b: entityB
    });
    
    // ✅ Validate response structure
    if (!response || !response.results) {
      throw new Error('Invalid comparison response received');
    }
    
    setComparison(response);
    
    // Add to comparison history
    const historyItem = {
      id: Date.now(),
      entityA: getSelectedEntityDetails(entityA),
      entityB: getSelectedEntityDetails(entityB),
      timestamp: new Date().toISOString(),
      resultCount: response.results?.length || 0,
      quality: response.comparison_summary?.comparison_quality || 'Unknown'
    };
    
    setComparisonHistory(prev => [historyItem, ...prev.slice(0, 4)]);
    
    if (response.results.length === 0) {
      toast.warning('No similarities found between these entities');
    } else {
      toast.success(`Found ${response.results.length} similarities!`);
    }
    
  } catch (error) {
    console.error('Comparison failed:', error);
    toast.error(`Comparison failed: ${error.message || 'Unknown error'}`);
  } finally {
    setLocalLoading(false);
  }
};


  const handleGenerateSummary = async () => {
    if (!comparison?.results || !Array.isArray(comparison.results)) return

    setSummaryLoading(true)
    try {
      const response = await generateSummary({
        tags: comparison.results.slice(0, 10)
      })
      
      setComparison({
        ...comparison,
        summary: response.summary
      })
    } catch (error) {
      console.error('Summary generation failed:', error)
    } finally {
      setSummaryLoading(false)
    }
  }

  const getSelectedEntityDetails = (entityId) => {
  const entity = availableEntities.find(entity => entity.id === entityId);
  if (!entity) {
    console.warn(`Entity not found: ${entityId}`);
    return null;
  }
  return entity;
};

  const handleQuickCompare = (historyItem) => {
    setEntityA(historyItem.entityA.id)
    setEntityB(historyItem.entityB.id)
  }

  const clearComparison = () => {
    setComparison(null)
    setEntityA('')
    setEntityB('')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">

        
        
        {/* ✅ Apple-Style Hero Section with Orange Gradient */}
        <section className="pt-4 pb-8">
          <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            
            <div className="relative z-10">
              {/* Status Badges */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  ⚡ AI-Powered Analysis
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  📊 Dynamic Insights
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  🔍 Deep Comparison
                </span>
              </div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight flex items-center">
                    <GitCompare className="w-8 h-8 lg:w-10 lg:h-10 mr-3" />
                    Entity Comparison Hub
                  </h1>
                  <p className="text-lg sm:text-xl text-orange-100 leading-relaxed max-w-2xl">
                    Compare two locations and discover their similarities with AI-powered insights and dynamic visualizations
                  </p>
                </div>
                
                {/* Stats Panel */}
                <div className="flex items-center space-x-4">
                  <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                    <div className="text-2xl font-bold">{availableEntities.length}</div>
                    <div className="text-sm text-orange-200">Available Entities</div>
                  </div>
                  {comparison && (
                    <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                      <div className="text-2xl font-bold">{comparison.results?.length || 0}</div>
                      <div className="text-sm text-orange-200">Similarities Found</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Recent Comparisons Panel */}
        {comparisonHistory.length > 0 && (
          <section className="pb-6">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Recent Comparisons
                </h3>
                <p className="text-sm text-gray-600 mt-1">Quick access to your previous analysis</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comparisonHistory.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all duration-300 hover:shadow-md"
                      onClick={() => handleQuickCompare(item)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold">
                          {item.resultCount} matches
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="truncate font-semibold text-gray-900">{item.entityA.name}</span>
                        <ArrowRight className="w-3 h-3 text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="truncate font-semibold text-gray-900">{item.entityB.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ✅ Main Comparison Form */}
        <section className="pb-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-600" />
                    Select Entities to Compare
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Choose two locations to analyze their similarities</p>
                </div>
                {comparison && (
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Clear Comparison
                  </button>
                )}
                
              </div>
            </div>
            
            <div className="p-6">
              {availableEntities.length === 0 ? (
                /* ✅ Empty State */
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-orange-600" />
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-900 mb-3">No entities available</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    You need to search for places first to enable the comparison functionality. 
                    Start by exploring locations in the Search page.
                  </p>
                  <button 
    onClick={() => navigate('/search')}
    className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
  >
    Go to Search Page
  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* ✅ Entity A Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-2">
                            A
                          </div>
                          First Entity
                        </label>
                        <div className="relative">
                          <select
                            value={entityA}
                            onChange={(e) => setEntityA(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-base appearance-none cursor-pointer"
                          >
                            <option value="">Choose first location...</option>
                            {availableEntities.map((entity) => (
                              <option key={entity.id} value={entity.id}>
                                {entity.name} {entity.address ? `- ${entity.address.split(',')[0]}` : ''}
                              </option>
                            ))}
                          </select>
                          <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      {entityA && (
                        <EntityComparisonCard 
                          entity={getSelectedEntityDetails(entityA)} 
                          label="A"
                          color="bg-gradient-to-br from-blue-500 to-indigo-600"
                        />
                      )}
                    </div>

                    {/* ✅ VS Separator */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                          VS
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur opacity-25 animate-pulse"></div>
                      </div>
                    </div>

                    {/* ✅ Entity B Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-2">
                            B
                          </div>
                          Second Entity
                        </label>
                        <div className="relative">
                          <select
                            value={entityB}
                            onChange={(e) => setEntityB(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-base appearance-none cursor-pointer"
                          >
                            <option value="">Choose second location...</option>
                            {availableEntities.map((entity) => (
                              <option key={entity.id} value={entity.id}>
                                {entity.name} {entity.address ? `- ${entity.address.split(',')[0]}` : ''}
                              </option>
                            ))}
                          </select>
                          <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      {entityB && (
                        <EntityComparisonCard 
                          entity={getSelectedEntityDetails(entityB)} 
                          label="B"
                          color="bg-gradient-to-br from-purple-500 to-violet-600"
                        />
                      )}
                    </div>
                  </div>

                  {/* ✅ Enhanced Compare Button */}
                  <div className="text-center">
                    <button
                      onClick={handleCompare}
                      disabled={!entityA || !entityB || localLoading || loading}
                      className="group relative px-12 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        {localLoading || loading ? (
                          <>
                            <div className="relative">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-white rounded-full animate-spin animation-delay-75"></div>
                            </div>
                            <span>Analyzing Similarities...</span>
                          </>
                        ) : (
                          <>
                            <GitCompare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span>Compare Entities</span>
                            <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ✅ Comparison Results Dashboard */}
        {comparison && comparison.comparison_summary && (
          <section className="pb-6">
            <ComparisonSummaryCard summary={comparison.comparison_summary} />
          </section>
        )}

        {/* ✅ Main Comparison Results */}
        {comparison && (
          <div className="space-y-6">
            {/* Visual Comparison Chart */}
            {comparison.results && comparison.results.length > 0 && (
              <section className="pb-6">
                <ComparisonChart 
                  data={comparison.results} 
                  entityA={getSelectedEntityDetails(entityA)}
                  entityB={getSelectedEntityDetails(entityB)}
                />
              </section>
            )}

            {/* Detailed Comparison View */}
            <section className="pb-6">
              <ComparisonView 
  comparison={comparison} 
  loading={localLoading || loading}
/>

            </section>
            
            {/* ✅ AI Summary Section with Apple Styling */}
            <section className="pb-8">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        AI-Powered Insights
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Advanced analysis with machine learning algorithms</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!comparison.summary && comparison.results?.length > 0 && (
                        <button
                          onClick={handleGenerateSummary}
                          disabled={summaryLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium"
                        >
                          {summaryLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          <span>Generate AI Summary</span>
                        </button>
                      )}
                      {comparison.summary && (
                        <PDFDownloadButton comparison={comparison} />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {comparison.summary ? (
                    <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-8 rounded-2xl border border-yellow-200">
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">
                          {comparison.summary}
                        </div>
                      </div>
                    </div>
                  ) : comparison.results?.length > 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-10 h-10 text-yellow-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready for AI Analysis</h4>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        Generate an intelligent summary to discover deeper insights about the similarities and differences between your selected entities.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                      <p className="text-gray-600">
                        Complete a comparison first to enable AI summary generation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


export default Compare
