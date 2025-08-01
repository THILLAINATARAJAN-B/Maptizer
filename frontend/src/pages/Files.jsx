import React, { useState, useEffect } from 'react'
import { 
  FileImage, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  CheckSquare,
  Square,
  Plus,
  Sparkles,
  Grid,
  List,
  Search,
  Filter,
  Upload,
  Share2,
  FileCheck,
  AlertCircle,
  RefreshCw,
  X,
  MousePointer // ✅ Replace SelectAll with MousePointer
} from 'lucide-react'
import toast from 'react-hot-toast'
import ImageViewer from '../components/files/ImageViewer'

const Files = () => {
  const [activeTab, setActiveTab] = useState('images')
  const [images, setImages] = useState([])
  const [pdfs, setPdfs] = useState([])
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  // ✅ Clear selections when switching tabs
  useEffect(() => {
    setSelectedFiles(new Set())
  }, [activeTab])

  const loadFiles = async () => {
    setLoading(true)
    setConnectionError(false)
    
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const [imagesResponse, pdfsResponse] = await Promise.all([
        fetch(`${baseURL}/chart-images`).catch(() => ({ 
          json: () => ({ success: false, images: [], error: 'Connection failed' }) 
        })),
        fetch(`${baseURL}/generated-pdfs`).catch(() => ({ 
          json: () => ({ success: false, pdfs: [], error: 'Connection failed' }) 
        }))
      ])

      const [imagesData, pdfsData] = await Promise.all([
        imagesResponse.json(),
        pdfsResponse.json()
      ])

      if (imagesData.error === 'Connection failed' && pdfsData.error === 'Connection failed') {
        setConnectionError(true)
        toast.error('Unable to connect to backend server')
        return
      }

      // ✅ Process images with complete URLs
      const processedImages = (imagesData.success ? imagesData.images || [] : []).map(img => ({
        ...img,
        id: img.filename, // ✅ Ensure each file has a unique ID
        downloadUrl: img.downloadUrl || `${baseURL}/chart-images/${img.filename}`,
        thumbnailUrl: img.thumbnailUrl || `${baseURL}/chart-images/${img.filename}`,
        type: 'image'
      }))

      // ✅ Process PDFs with complete URLs and enhanced metadata
      const processedPdfs = (pdfsData.success ? pdfsData.pdfs || [] : []).map(pdf => ({
        ...pdf,
        id: pdf.filename, // ✅ Ensure each file has a unique ID
        downloadUrl: pdf.downloadUrl || `${baseURL}/generated-pdfs/${pdf.filename}`,
        title: pdf.metadata?.title || pdf.filename.replace(/\.[^/.]+$/, ""),
        description: pdf.metadata?.description || 'Generated PDF report',
        pageCount: pdf.metadata?.totalPages || 'Unknown',
        fileType: 'PDF Report',
        type: 'pdf'
      }))

      setImages(processedImages)
      setPdfs(processedPdfs)
      
      console.log(`Loaded ${processedImages.length} images and ${processedPdfs.length} PDFs`)
      
    } catch (error) {
      console.error('Error loading files:', error)
      setConnectionError(true)
      toast.error('Backend server not running. Please start backend.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Enhanced toggle selection for individual files
  const toggleSelection = (fileId) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
      toast.success('File deselected', { duration: 1000 })
    } else {
      newSelection.add(fileId)
      toast.success('File selected', { duration: 1000 })
    }
    setSelectedFiles(newSelection)
  }

  // ✅ Enhanced select all functionality
  const selectAll = () => {
    const currentFiles = activeTab === 'images' ? filteredImages : filteredPdfs
    const currentFileIds = currentFiles.map(f => f.filename)
    
    if (selectedFiles.size === currentFiles.length && currentFiles.length > 0) {
      // ✅ Deselect all
      setSelectedFiles(new Set())
      toast.success(`All ${activeTab} deselected`, { duration: 1500 })
    } else {
      // ✅ Select all current files
      setSelectedFiles(new Set(currentFileIds))
      toast.success(`All ${currentFiles.length} ${activeTab} selected`, { duration: 1500 })
    }
  }

  // ✅ Select only current tab files (images or PDFs)
  const selectCurrentTab = () => {
    const currentFiles = activeTab === 'images' ? filteredImages : filteredPdfs
    const currentFileIds = currentFiles.map(f => f.filename)
    setSelectedFiles(new Set(currentFileIds))
    toast.success(`Selected all ${currentFiles.length} ${activeTab}`)
  }

  // ✅ Clear all selections
  const clearAllSelections = () => {
    setSelectedFiles(new Set())
    toast.success('All selections cleared')
  }

  // ✅ Select by file type
  const selectByType = (type) => {
    const targetFiles = type === 'images' ? images : pdfs
    const fileIds = targetFiles.map(f => f.filename)
    setSelectedFiles(new Set(fileIds))
    toast.success(`Selected all ${targetFiles.length} ${type}`)
  }

  const generateCombinedPDF = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Please select files to include in PDF')
      return
    }
    setGenerating(true)
    const toastId = toast.loading('Generating professional PDF report...')

    try {
      const selectedImgs = images.filter(i => selectedFiles.has(i.filename))
      const selectedPdfs = pdfs.filter(p => selectedFiles.has(p.filename))
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const res = await fetch(`${baseURL}/generate-combined-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImgs.map(i => ({ filename: i.filename, chartType: i.chartType, metadata: i.metadata })),
          pdfs: selectedPdfs.map(p => ({ filename: p.filename, metadata: p.metadata })),
          generateSummary: false,
          metadata: {
            createdAt: new Date().toISOString(),
            totalFiles: selectedFiles.size,
            includesImages: selectedImgs.length > 0,
            includesPdfs: selectedPdfs.length > 0,
            reportType: 'Professional Chart Collection',
            title: `Analytics Report - ${new Date().toLocaleDateString()}`
          }
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Professional PDF generated successfully! (${data.metadata?.totalPages || 'Multiple'} pages)`, { id: toastId })
        setSelectedFiles(new Set())
        loadFiles()
      } else {
        throw new Error(data.error || 'Failed to generate PDF')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to generate PDF', { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  const deleteFile = async (filename, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const endpoint = type === 'image' ? '/chart-images' : '/generated-pdfs'
      const res = await fetch(`${baseURL}${endpoint}/${filename}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        if (type === 'image') {
          setImages(images.filter(i => i.filename !== filename))
        } else {
          setPdfs(pdfs.filter(p => p.filename !== filename))
        }
        // ✅ Remove from selection if it was selected
        const newSelection = new Set(selectedFiles)
        newSelection.delete(filename)
        setSelectedFiles(newSelection)
        toast.success(`${type} deleted successfully`)
      } else {
        throw new Error(data.error)
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete file')
    }
  }

  // ✅ Delete selected files in bulk
  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for deletion')
      return
    }

    const selectedImages = images.filter(i => selectedFiles.has(i.filename))
    const selectedPdfsFiles = pdfs.filter(p => selectedFiles.has(p.filename))
    const totalFiles = selectedImages.length + selectedPdfsFiles.length

    if (!confirm(`Are you sure you want to delete ${totalFiles} selected files? This action cannot be undone.`)) {
      return
    }

    const toastId = toast.loading(`Deleting ${totalFiles} selected files...`)
    let deletedCount = 0
    let failedCount = 0

    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      // Delete selected images
      for (const image of selectedImages) {
        try {
          const res = await fetch(`${baseURL}/chart-images/${image.filename}`, { method: 'DELETE' })
          const data = await res.json()
          if (data.success) {
            deletedCount++
          } else {
            failedCount++
          }
        } catch (error) {
          failedCount++
        }
      }

      // Delete selected PDFs
      for (const pdf of selectedPdfsFiles) {
        try {
          const res = await fetch(`${baseURL}/generated-pdfs/${pdf.filename}`, { method: 'DELETE' })
          const data = await res.json()
          if (data.success) {
            deletedCount++
          } else {
            failedCount++
          }
        } catch (error) {
          failedCount++
        }
      }

      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} files`, { id: toastId })
        setSelectedFiles(new Set())
        loadFiles()
      }

      if (failedCount > 0) {
        toast.error(`Failed to delete ${failedCount} files`)
      }

    } catch (error) {
      toast.error('Failed to delete selected files', { id: toastId })
    }
  }

  const downloadFile = (url, filename) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started')
    } catch (e) {
      console.error(e)
      toast.error('Download failed')
    }
  }

  const openPreview = (image) => {
    setPreviewImage(image)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewImage(null)
    setIsPreviewOpen(false)
  }

  const filteredImages = images.filter(img => {
    const searchLower = searchTerm.toLowerCase()
    return (
      img.filename.toLowerCase().includes(searchLower) ||
      (img.chartType && img.chartType.toLowerCase().includes(searchLower))
    ) && (filterType === 'all' || img.chartType === filterType)
  })

  const filteredPdfs = pdfs.filter(pdf => {
    const searchLower = searchTerm.toLowerCase()
    return (
      pdf.filename.toLowerCase().includes(searchLower) ||
      (pdf.title && pdf.title.toLowerCase().includes(searchLower)) ||
      (pdf.description && pdf.description.toLowerCase().includes(searchLower))
    )
  })

  const currentFiles = activeTab === 'images' ? filteredImages : filteredPdfs
  const totalFiles = activeTab === 'images' ? images.length : pdfs.length
  
  // ✅ Selection statistics
  const selectedImagesCount = images.filter(img => selectedFiles.has(img.filename)).length
  const selectedPdfsCount = pdfs.filter(pdf => selectedFiles.has(pdf.filename)).length
  const isAllCurrentSelected = selectedFiles.size === currentFiles.length && currentFiles.length > 0

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Files</h3>
            <p className="text-gray-600">Retrieving saved images and PDFs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Backend Server Not Running</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Unable to connect to the backend server. Please start your backend server and try again.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-gray-700 font-mono">
                cd backend<br/>
                npm start
              </p>
            </div>
            <button
              onClick={loadFiles}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                <FileCheck className="w-8 h-8 mr-3 text-orange-600" />
                Files & Documents
              </h1>
              <p className="text-gray-600">
                Manage your chart images and PDF reports • {currentFiles.length} of {totalFiles} files
                {selectedFiles.size > 0 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    • {selectedFiles.size} selected ({selectedImagesCount} images, {selectedPdfsCount} PDFs)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 flex-wrap">
              {/* ✅ Refresh button */}
              <button
                onClick={loadFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Refresh files"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>

              {/* ✅ Enhanced Selection Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAll}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                    isAllCurrentSelected
                      ? 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isAllCurrentSelected ? `Deselect all ${activeTab}` : `Select all ${activeTab}`}
                >
                  {isAllCurrentSelected ? 
                    <CheckSquare className="w-4 h-4 text-orange-600" /> : 
                    <Square className="w-4 h-4" />
                  }
                  <span className="text-sm">
                    {isAllCurrentSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </button>

                {/* ✅ Quick selection dropdown - Fixed icon */}
                {(images.length > 0 || pdfs.length > 0) && (
                  <div className="relative group">
                    <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <MousePointer className="w-4 h-4" />
                      <span>Quick Select</span>
                    </button>
                    
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => selectByType('images')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                          disabled={images.length === 0}
                        >
                          All Images ({images.length})
                        </button>
                        <button
                          onClick={() => selectByType('pdfs')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                          disabled={pdfs.length === 0}
                        >
                          All PDFs ({pdfs.length})
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={clearAllSelections}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                          disabled={selectedFiles.size === 0}
                        >
                          Clear All Selections
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Enhanced Selected Files Actions */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 border border-orange-300 rounded-lg">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    {selectedFiles.size} selected
                  </span>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={generateCombinedPDF}
                      disabled={generating}
                      className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 disabled:opacity-50"
                      title="Generate PDF from selected files"
                    >
                      {generating ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{generating ? 'Generating...' : 'Create PDF'}</span>
                    </button>

                    <button
                      onClick={deleteSelectedFiles}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                      title="Delete selected files"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={clearAllSelections}
                      className="flex items-center space-x-1 px-2 py-1 text-orange-700 hover:bg-orange-200 rounded-md"
                      title="Clear selection"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                <span className="text-sm">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'images'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileImage className="w-4 h-4" />
                <span>Chart Images ({images.length})</span>
                {selectedImagesCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                    {selectedImagesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('pdfs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'pdfs'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PDF Reports ({pdfs.length})</span>
                {selectedPdfsCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                    {selectedPdfsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {activeTab === 'images' && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Chart Types</option>
                  {[...new Set(images.map(img => img.chartType))].map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Files Grid/List Display */}
        {currentFiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
              {activeTab === 'images' ? <FileImage className="w-full h-full" /> : <FileText className="w-full h-full" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab === 'images' ? 'Chart Images' : 'PDF Reports'} Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || (activeTab === 'images' && filterType !== 'all')
                ? `No ${activeTab} match your search criteria. Try adjusting your filters.`
                : `Start capturing charts from the Analytics page to create ${activeTab === 'images' ? 'images' : 'reports'}.`
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {currentFiles.map((file) => {
              const isSelected = selectedFiles.has(file.filename)
              const isImage = activeTab === 'images'
              
              return (
                <div key={file.filename} className={`bg-white border-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isSelected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                } ${viewMode === 'grid' ? 'relative' : 'flex items-center p-4 space-x-4'}`}>
                  
                  {/* ✅ FIXED: Enhanced Selection Checkbox - More Prominent */}
                  <div className={`${viewMode === 'grid' ? 'absolute top-3 left-3' : 'relative'} z-20`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleSelection(file.filename)
                      }}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
                        isSelected 
                          ? 'bg-orange-600 border-orange-600 scale-110 shadow-lg' 
                          : 'bg-white border-gray-400 hover:border-orange-500 hover:scale-105 hover:shadow-md'
                      }`}
                      style={{ backgroundColor: isSelected ? '#ea580c' : 'white' }}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {viewMode === 'grid' ? (
                    <>
                      {/* File Preview */}
                      <div 
                        className="aspect-video bg-gray-100 relative group cursor-pointer" 
                        onClick={() => isImage && openPreview(file)}
                        style={{ marginTop: '12px' }} // ✅ Add space for checkbox
                      >
                        {isImage ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={`${file.chartType} chart`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Thumbnail load error:', e)
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEySDMiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                            <div className="text-center">
                              <FileText className="w-16 h-16 text-red-500 mx-auto mb-2" />
                              <div className="text-xs font-medium text-red-700">PDF Report</div>
                              <div className="text-xs text-red-600">{file.pageCount} pages</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isImage) {
                                  openPreview(file)
                                } else {
                                  window.open(file.downloadUrl, '_blank')
                                }
                              }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadFile(file.downloadUrl, file.filename)
                              }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFile(file.filename, isImage ? 'image' : 'pdf')
                              }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>

                        {/* ✅ Selection indicator overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500 bg-opacity-10 border-2 border-orange-500 rounded-lg pointer-events-none"></div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {isImage 
                            ? file.chartType?.charAt(0).toUpperCase() + file.chartType?.slice(1).replace(/-/g, ' ')
                            : file.title || file.filename
                          }
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(file.timestamp).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(file.fileSize || 0)}</span>
                          {isSelected && (
                            <span className="text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded">
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        {!isImage && file.pageCount && (
                          <div className="text-xs text-gray-500 mt-1">
                            {file.pageCount} pages
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View Layout */}
                      <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {isImage ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={`${file.chartType} chart`}
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={() => openPreview(file)}
                            onError={(e) => {
                              console.error('Thumbnail load error:', e)
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-red-50">
                            <FileText className="w-6 h-6 text-red-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {isImage 
                            ? file.chartType?.charAt(0).toUpperCase() + file.chartType?.slice(1).replace(/-/g, ' ')
                            : file.title || file.filename
                          }
                        </h3>
                        <p className="text-sm text-gray-600">{new Date(file.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize || 0)}
                          {!isImage && file.pageCount && ` • ${file.pageCount} pages`}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
                          ✓ Selected
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (isImage) {
                              openPreview(file)
                            } else {
                              window.open(file.downloadUrl, '_blank')
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file.downloadUrl, file.filename)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.filename, isImage ? 'image' : 'pdf')}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Image Preview Modal */}
        <ImageViewer 
          image={previewImage}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      </div>
    </div>
  )
}

export default Files
