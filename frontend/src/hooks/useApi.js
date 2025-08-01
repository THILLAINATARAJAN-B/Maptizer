import { useState, useCallback } from 'react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const executeRequest = useCallback(async (apiCall, options = {}) => {
    const { showToast = true, loadingMessage = 'Loading...' } = options
    
    setLoading(true)
    setError(null)
    
    let toastId
    if (showToast) {
      toastId = toast.loading(loadingMessage)
    }

    try {
      const response = await apiCall()
      
      if (showToast) {
        toast.success('Success!', { id: toastId })
      }
      
      // ✅ Fixed: Handle different response structures
      return response.data || response
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong'
      setError(errorMessage)
      
      if (showToast) {
        toast.error(errorMessage, { id: toastId })
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchPlaces = useCallback((data) => {
    return executeRequest(
      () => apiService.searchPlaces(data),
      { loadingMessage: 'Searching places...' }
    )
  }, [executeRequest])

  const getHeatmap = useCallback((params) => {
    return executeRequest(
      () => apiService.getHeatmap(params),
      { loadingMessage: 'Loading heatmap...' }
    )
  }, [executeRequest])

  const getEntityDetails = useCallback((params) => {
    return executeRequest(
      () => apiService.getEntityDetails(params),
      { loadingMessage: 'Loading entity details...' }
    )
  }, [executeRequest])

  const compareEntities = useCallback((params) => {
    return executeRequest(
      () => apiService.compareEntities(params),
      { loadingMessage: 'Comparing entities...' }
    )
  }, [executeRequest])

  const getInsights = useCallback((type, params) => {
    const apiMap = {
      artists: apiService.getArtistInsights,
      movies: apiService.getMovieInsights,
      books: apiService.getBookInsights
    }
    
    return executeRequest(
      () => apiMap[type](params),
      { loadingMessage: `Loading ${type} insights...` }
    )
  }, [executeRequest])

  const generateSummary = useCallback((data) => {
    return executeRequest(
      () => apiService.generateSummary(data),
      { loadingMessage: 'Generating AI summary...' }
    )
  }, [executeRequest])

  const getCombinedData = useCallback((data) => {
    return executeRequest(
      () => apiService.getCombinedData(data),
      { loadingMessage: 'Loading combined data...' }
    )
  }, [executeRequest])

  // ✅ Fixed PDF Generation - Use apiService instead of direct fetch
  const generateComparisonPDF = useCallback(async (comparisonData, summary) => {
    const toastId = toast.loading('Generating PDF...')
    
    try {
      const result = await apiService.generatePDF({ comparisonData, summary })
      
      if (result.success) {
        toast.success('PDF generated successfully!', { id: toastId })
        return result
      } else {
        throw new Error(result.message || 'PDF generation failed')
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Failed to generate PDF', { id: toastId })
      throw error
    }
  }, [])

  // ✅ Fixed PDF Download - Use apiService with proper blob handling
  const downloadPDF = useCallback(async (filename) => {
    const toastId = toast.loading('Downloading PDF...')
    
    try {
      const blob = await apiService.downloadPDF(filename)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('PDF downloaded successfully!', { id: toastId })
    } catch (error) {
      console.error('PDF download failed:', error)
      toast.error('Failed to download PDF', { id: toastId })
      throw error
    }
  }, [])

  // ✅ Enhanced Combined PDF Generation and Download
  const generateAndDownloadPDF = useCallback(async (comparisonData, summary) => {
    const toastId = toast.loading('Preparing PDF report...')
    
    try {
      // Step 1: Generate PDF
      toast.loading('Generating PDF...', { id: toastId })
      const pdfResponse = await generateComparisonPDF(comparisonData, summary)
      
      if (pdfResponse.success && pdfResponse.filename) {
        // Step 2: Download the PDF
        toast.loading('Downloading PDF...', { id: toastId })
        await downloadPDF(pdfResponse.filename)
        
        toast.success('PDF report downloaded successfully!', { id: toastId })
        return pdfResponse
      } else {
        throw new Error('PDF generation failed')
      }
    } catch (error) {
      toast.error('Failed to generate and download PDF', { id: toastId })
      throw error
    }
  }, [generateComparisonPDF, downloadPDF])

  // ✅ Additional utility functions
  const healthCheck = useCallback(() => {
    return executeRequest(
      () => apiService.healthCheck(),
      { loadingMessage: 'Checking connection...', showToast: false }
    )
  }, [executeRequest])

  const geocodeLocation = useCallback((address) => {
    return executeRequest(
      () => apiService.geocodeLocation(address),
      { loadingMessage: 'Finding location...', showToast: false }
    )
  }, [executeRequest])

  const reverseGeocode = useCallback((lat, lng) => {
    return executeRequest(
      () => apiService.reverseGeocode(lat, lng),
      { loadingMessage: 'Getting address...', showToast: false }
    )
  }, [executeRequest])

  return {
    // State
    loading,
    error,
    
    // Core API methods
    searchPlaces,
    getHeatmap,
    getEntityDetails,
    compareEntities,
    getInsights,
    generateSummary,
    getCombinedData,
    
    // PDF methods
    generateComparisonPDF,
    downloadPDF,
    generateAndDownloadPDF,
    
    // Utility methods
    healthCheck,
    geocodeLocation,
    reverseGeocode
  }
}
