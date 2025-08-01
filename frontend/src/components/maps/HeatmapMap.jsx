import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import { 
  Thermometer, 
  MapPin, 
  TrendingUp, 
  Info, 
  Layers, 
  Eye, 
  EyeOff, 
  Settings, 
  Camera,
  Download,
  Save
} from 'lucide-react'

const HeatmapMap = ({ 
  data = [], 
  center = [11.0168, 76.9558], 
  zoom = 12, 
  height = '500px',
  intensity = 0.6,
  radius = 30,
  showControls = true,
  onPointClick
}) => {
  const [mapMode, setMapMode] = useState('heat') // 'heat', 'markers', 'both'
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  
  // ✅ Map container ref for capturing
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // ✅ Enhanced data validation and processing
  const validData = Array.isArray(data) ? data.filter(point => {
    const lat = point?.lat || point?.location?.latitude;
    const lng = point?.lng || point?.location?.longitude;
    
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      console.warn('Invalid coordinates for heatmap point:', point);
      return false;
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      console.warn('Coordinates out of valid range:', { lat: latNum, lng: lngNum });
      return false;
    }
    
    return true;
  }).map(point => ({
    ...point,
    lat: parseFloat(point.lat || point.location?.latitude),
    lng: parseFloat(point.lng || point.location?.longitude),
    intensity: Math.max(0, Math.min(1, parseFloat(point.metrics?.intensity || point.intensity || 0.5))),
    name: point.location?.name || point.name || 'Unknown Location',
    category: point.location?.category || point.category || 'general',
    popularity: Math.max(0, Math.min(1, parseFloat(point.metrics?.popularity || point.popularity || 0.5)))
  })) : [];

  // ✅ **NEW**: Capture map as image function
  const captureMapImage = async () => {
    if (!mapContainerRef.current) {
      toast.error('Map is not loaded yet')
      return
    }

    setIsCapturing(true)
    const toastId = toast.loading('Capturing map image...')

    try {
      // ✅ Wait a bit for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500))

      // ✅ Capture the map container
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 1,
        width: mapContainerRef.current.offsetWidth,
        height: mapContainerRef.current.offsetHeight,
        backgroundColor: '#ffffff'
      })

      const base64Image = canvas.toDataURL('image/png', 0.9)

      // ✅ Prepare metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        center: center,
        zoom: zoom,
        mapMode: mapMode,
        dataPoints: validData.length,
        intensity: intensity,
        radius: radius,
        chartType: 'heatmap-map',
        categories: [...new Set(validData.map(p => p.category))],
        bounds: mapInstanceRef.current ? {
          north: mapInstanceRef.current.getBounds().getNorth(),
          south: mapInstanceRef.current.getBounds().getSouth(),
          east: mapInstanceRef.current.getBounds().getEast(),
          west: mapInstanceRef.current.getBounds().getWest()
        } : null
      }

      // ✅ Send to backend
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseURL}/save-chart-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          chartType: 'heatmap-map',
          chartId: `heatmap_${Date.now()}`,
          metadata: metadata
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Map image saved successfully!', { id: toastId })
      } else {
        throw new Error(result.error || 'Failed to save map image')
      }

    } catch (error) {
      console.error('Capture error:', error)
      toast.error(`Failed to capture map: ${error.message}`, { id: toastId })
    } finally {
      setIsCapturing(false)
    }
  }

  if (validData.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 flex flex-col items-center justify-center" style={{ height }}>
        <Thermometer className="w-16 h-16 text-orange-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Heatmap Data</h3>
        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          No heatmap points available for the current filters. Try adjusting your search criteria or expanding the analysis radius.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* ✅ Enhanced Map Controls with Capture Button */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center divide-x divide-gray-200">
            {/* Mode Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setMapMode(mapMode === 'heat' ? 'markers' : mapMode === 'markers' ? 'both' : 'heat')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mapMode === 'heat' 
                    ? 'bg-red-100 text-red-700' 
                    : mapMode === 'markers'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
                title={`Current: ${mapMode} - Click to cycle`}
              >
                {mapMode === 'heat' ? (
                  <>
                    <Thermometer className="w-4 h-4" />
                    <span>Heatmap</span>
                  </>
                ) : mapMode === 'markers' ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    <span>Markers</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Both</span>
                  </>
                )}
              </button>
            </div>

            {/* ✅ **NEW**: Capture Button */}
            <div className="px-3 py-2">
              <button
                onClick={captureMapImage}
                disabled={isCapturing}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isCapturing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title="Capture and save map as image"
              >
                {isCapturing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Capture</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Details Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-colors ${
                  showDetails ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                }`}
                title="Toggle statistics panel"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Settings Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-1 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Toggle settings"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced Statistics Panel */}
      {showDetails && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 max-w-xs">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-gray-900">Heatmap Analytics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                <div className="text-xl font-bold text-orange-700">{validData.length}</div>
                <div className="text-orange-600 font-medium">Data Points</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xl font-bold text-blue-700">
                  {validData.length > 0 ? 
                    (validData.reduce((sum, p) => sum + (p.intensity || 0), 0) / validData.length).toFixed(2) 
                    : '0'
                  }
                </div>
                <div className="text-blue-600 font-medium">Avg Intensity</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="text-xl font-bold text-green-700">
                  {validData.length > 0 ? 
                    Math.max(...validData.map(p => (p.popularity || 0) * 100)).toFixed(0) + '%'
                    : '0%'
                  }
                </div>
                <div className="text-green-600 font-medium">Max Popularity</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200">
                <div className="text-xl font-bold text-purple-700">
                  {new Set(validData.map(p => p.category || 'general')).size}
                </div>
                <div className="text-purple-600 font-medium">Categories</div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Top Categories</h4>
              <div className="space-y-1">
                {Object.entries(validData.reduce((acc, p) => {
                  const cat = p.category || 'general';
                  acc[cat] = (acc[cat] || 0) + 1;
                  return acc;
                }, {}))
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{category}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 min-w-[250px]">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Visualization Settings
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Heat Intensity</label>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1" 
                defaultValue={intensity}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Heat Radius</label>
              <input 
                type="range" 
                min="10" 
                max="50" 
                step="5" 
                defaultValue={radius}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ✅ Main Map Container with ref */}
      <div ref={mapContainerRef} style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapInstanceRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* ✅ Enhanced Heatmap Layer */}
          {(mapMode === 'heat' || mapMode === 'both') && (
            <HeatmapLayer 
              data={validData} 
              intensity={intensity} 
              radius={radius}
            />
          )}
          
          {/* ✅ Enhanced Markers Layer */}
          {(mapMode === 'markers' || mapMode === 'both') && (
            <MarkersLayer 
              data={validData}
              onPointClick={(point) => {
                setSelectedPoint(point);
                if (onPointClick) onPointClick(point);
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* ✅ Enhanced Point Details Modal */}
      {selectedPoint && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Location Details
              </h3>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{selectedPoint.name || 'Unknown Location'}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedPoint.location?.address || 'No address available'}</p>
                {selectedPoint.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium capitalize">
                    {selectedPoint.category}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700 mb-1">
                    {((selectedPoint.intensity || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Heat Intensity</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">
                    {((selectedPoint.popularity || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Popularity</div>
                </div>
              </div>
              
              {selectedPoint.location?.businessRating && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Business Rating</span>
                    <span className="text-lg font-bold text-gray-900">{selectedPoint.location.businessRating} ★</span>
                  </div>
                </div>
              )}
              
              {selectedPoint.location?.amenities && selectedPoint.location.amenities.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Amenities</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedPoint.location.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Enhanced Heatmap Layer Component
const HeatmapLayer = ({ data, intensity, radius }) => {
  const map = useMap();
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!map || !data.length) return;

    // Remove existing heatmap
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
    }

    // ✅ Prepare enhanced heatmap data
    const heatmapData = data.map(point => {
      const baseIntensity = point.intensity || 0.5;
      const enhancedIntensity = Math.min(1, baseIntensity * intensity * 2);
      
      return [
        point.lat,
        point.lng,
        enhancedIntensity
      ];
    });

    // ✅ Create enhanced heatmap with better styling
    heatmapRef.current = L.heatLayer(heatmapData, {
      radius: radius,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.1,
      gradient: {
        0.0: '#3b82f6',   // Blue for low intensity
        0.2: '#10b981',   // Green
        0.4: '#eab308',   // Yellow
        0.6: '#f97316',   // Orange
        0.8: '#ef4444',   // Red
        1.0: '#dc2626'    // Dark red for highest intensity
      }
    }).addTo(map);

    return () => {
      if (heatmapRef.current && map) {
        map.removeLayer(heatmapRef.current);
      }
    };
  }, [map, data, intensity, radius]);

  return null;
};

// ✅ Enhanced Markers Layer Component  
const MarkersLayer = ({ data, onPointClick }) => {
  const map = useMap();
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // ✅ Create enhanced markers with categories
    data.forEach(point => {
      const intensity = point.intensity || 0.5;
      const size = Math.max(6, Math.min(15, intensity * 25));
      
      // Color based on category
      const categoryColors = {
        restaurant: '#ef4444',
        cafe: '#f97316',
        shop: '#10b981',
        hotel: '#3b82f6',
        office: '#8b5cf6',
        park: '#22c55e',
        general: '#6b7280'
      };
      
      const color = categoryColors[point.category] || categoryColors.general;

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: size,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7
      })
      .bindPopup(`
        <div class="p-3">
          <h4 class="font-bold text-gray-900 mb-1">${point.name || 'Unknown Location'}</h4>
          <p class="text-sm text-gray-600 mb-2">${point.category || 'General'}</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="font-medium">Intensity:</span> ${(intensity * 100).toFixed(0)}%
            </div>
            <div>
              <span class="font-medium">Popularity:</span> ${((point.popularity || 0) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      `)
      .on('click', () => onPointClick?.(point))
      .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => {
        if (map) map.removeLayer(marker);
      });
    };
  }, [map, data, onPointClick]);

  return null;
};

export default HeatmapMap;
