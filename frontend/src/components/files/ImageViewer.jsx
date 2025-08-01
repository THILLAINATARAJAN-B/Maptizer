import React, { useState } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const ImageViewer = ({ image, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!isOpen || !image) return null

  const handleDownload = () => {
    try {
      const link = document.createElement('a')
      link.href = image.downloadUrl
      link.download = image.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started')
    } catch (e) {
      console.error('Download error:', e)
      toast.error('Download failed')
    }
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-6xl w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <div className="text-white">
            <h3 className="font-semibold text-lg truncate max-w-md">{image.filename}</h3>
            <p className="text-sm opacity-75">
              {image.chartType} • {new Date(image.timestamp).toLocaleDateString()}
            </p>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 5))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={resetView}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
              title="Reset View"
            >
              Reset
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center bg-black p-4 overflow-hidden">
          <img
            src={image.downloadUrl}
            alt={image.filename}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
              cursor: zoom > 1 ? 'grab' : 'default'
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}

export default ImageViewer
