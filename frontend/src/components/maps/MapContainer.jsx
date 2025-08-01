import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { Layers, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapContainer = ({ 
  data = [], 
  center = [11.0168, 76.9558], 
  zoom = 13, 
  height = '400px',
  showControls = true,
  enableClustering = false,
  onMarkerClick
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTileLayer, setCurrentTileLayer] = useState('osm')

  // ✅ Tile layer options
  // ✅ UPDATE tileLayers object (around line 20):
  const tileLayers = {
    osm: {
      url: import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      name: 'OpenStreetMap'
    },
    satellite: {
      url: import.meta.env.VITE_SATELLITE_TILES_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
      name: 'Satellite'
    },
    terrain: {
      url: import.meta.env.VITE_TERRAIN_TILES_URL || 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap',
      name: 'Terrain'
    }
  }


  // ✅ Create enhanced marker with category styling
  const createEnhancedMarker = (item, index) => {
    const popupContent = `
      <div style="
        padding: 16px;
        min-width: 240px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f97316, #ea580c);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
          ">
            📍
          </div>
          <div>
            <h4 style="
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
              line-height: 1.3;
            ">${item.name || `Location ${index + 1}`}</h4>
            ${item.category ? `
              <span style="
                background: #f3f4f6;
                color: #374151;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
              ">${item.category}</span>
            ` : ''}
          </div>
        </div>
        
        ${item.address ? `
          <div style="
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 12px;
            line-height: 1.4;
          ">📍 ${item.address}</div>
        ` : ''}
        
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        ">
          ${item.popularity ? `
            <div style="
              background: #fef3e2;
              padding: 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="color: #ea580c; font-size: 11px; font-weight: 500;">Popularity</div>
              <div style="color: #9a3412; font-size: 14px; font-weight: 600;">
                ${(item.popularity * 100).toFixed(0)}%
              </div>
            </div>
          ` : ''}
          
          ${item.rating ? `
            <div style="
              background: #fefce8;
              padding: 8px;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="color: #ca8a04; font-size: 11px; font-weight: 500;">Rating</div>
              <div style="color: #92400e; font-size: 14px; font-weight: 600;">
                ⭐ ${item.rating.toFixed(1)}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div style="
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
          text-align: center;
        ">
          <button style="
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          " onclick="handleMarkerDetailsClick('${item.id || index}')">
            View Full Details
          </button>

        </div>
      </div>
    `
    
    return popupContent
  }

  // ✅ Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false, // We'll add custom controls
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
      })

      // Add initial tile layer
      const initialLayer = tileLayers[currentTileLayer]
      L.tileLayer(initialLayer.url, {
        attribution: initialLayer.attribution,
        maxZoom: 19
      }).addTo(mapInstanceRef.current)
    }

    // Global function for popup buttons
    window.handleMarkerDetailsClick = (itemId) => {
      const item = data.find(d => (d.id || data.indexOf(d).toString()) === itemId)
      if (item && onMarkerClick) {
        onMarkerClick(item)
      }
    }

    // Clear existing markers
    if (markersRef.current) {
      mapInstanceRef.current.removeLayer(markersRef.current)
    }

    // Create marker group
    markersRef.current = enableClustering 
      ? L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `
                <div style="
                  background: linear-gradient(135deg, #f97316, #ea580c);
                  color: white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 600;
                  font-size: 14px;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                ">${count}</div>
              `,
              className: 'custom-cluster-icon',
              iconSize: [40, 40]
            })
          }
        })
      : L.layerGroup()

    // Add markers
    data.forEach((item, index) => {
      if (item.lat && item.lng) {
        const marker = L.marker([item.lat, item.lng], {
          icon: L.divIcon({
            className: 'custom-enhanced-marker',
            html: `
              <div style="
                background: linear-gradient(135deg, #f97316, #ea580c);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                transition: all 0.3s ease;
              ">
                📍
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        })
        
        marker.bindPopup(createEnhancedMarker(item, index), {
          maxWidth: 280,
          className: 'custom-enhanced-popup'
        })

        // Add hover effects
        marker.on('mouseover', function() {
          this.getElement().style.transform = 'scale(1.1)'
          this.getElement().style.zIndex = '1000'
        })

        marker.on('mouseout', function() {
          this.getElement().style.transform = 'scale(1)'
          this.getElement().style.zIndex = '100'
        })
        
        markersRef.current.addLayer(marker)
      }
    })

    // Add markers to map
    mapInstanceRef.current.addLayer(markersRef.current)

    // Update map view
    mapInstanceRef.current.setView(center, zoom)

    return () => {
      if (markersRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markersRef.current)
      }
    }
  }, [data, center, zoom, enableClustering, currentTileLayer])

  // ✅ Custom control functions
  const zoomIn = () => mapInstanceRef.current?.zoomIn()
  const zoomOut = () => mapInstanceRef.current?.zoomOut()
  const resetView = () => mapInstanceRef.current?.setView(center, zoom)
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const switchTileLayer = () => {
    const layers = Object.keys(tileLayers)
    const currentIndex = layers.indexOf(currentTileLayer)
    const nextIndex = (currentIndex + 1) % layers.length
    setCurrentTileLayer(layers[nextIndex])
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (window.showLocationDetails) {
        delete window.showLocationDetails
      }
    }
  }, [])

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div 
        ref={mapRef} 
        style={{ height: isFullscreen ? '100vh' : height, width: '100%' }}
        className="rounded-lg overflow-hidden"
      />
      
      {/* ✅ Custom Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-1000 space-y-2">
          {/* Layer Switcher */}
          <button
            onClick={switchTileLayer}
            className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
            title={`Switch to ${tileLayers[currentTileLayer].name}`}
            aria-label={`Switch map layer to ${tileLayers[currentTileLayer].name}`} // ✅ ADD THIS
          >
            <Layers className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Zoom Controls */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={zoomIn}
              className="block w-full p-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={zoomOut}
              className="block w-full p-2 hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          {/* Utility Controls */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={resetView}
              className="block w-full p-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="block w-full p-2 hover:bg-gray-50 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
      
      {/* ✅ Map Info Panel */}
      <div className="absolute bottom-4 left-4 z-1000">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              {data.length} location{data.length !== 1 ? 's' : ''} • {tileLayers[currentTileLayer].name}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapContainer
