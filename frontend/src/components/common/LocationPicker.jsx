import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Check, X, Crosshair } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../../context/AppContext'

// Custom crosshair icon for location selection
const crosshairIcon = L.divIcon({
  html: `
    <div style="
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      font-size: 24px;
    ">
      ✚
    </div>
  `,
  className: 'crosshair-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

// Component to handle map clicks
const LocationSelector = ({ onLocationSelect, selectedPosition }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) })
    }
  })

  return selectedPosition ? (
    <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={crosshairIcon} />
  ) : null
}

const LocationPicker = ({ isOpen, onClose, onLocationConfirm }) => {
  const { selectedLocation } = useApp()
  const [tempLocation, setTempLocation] = useState({
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    name: selectedLocation.name
  })
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false)
  const mapRef = useRef(null)

  // ✅ Fixed: Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLocationSelect = (position) => {
    setTempLocation({
      ...position,
      name: `${position.lat}, ${position.lng}` // Temporary name
    })
    
    // Reverse geocode to get location name
    reverseGeocode(position.lat, position.lng)
  }

  const reverseGeocode = async (lat, lng) => {
    setIsGeocodingLocation(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'QlooInsights/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        // Extract meaningful location name
        const locationName = data.name || 
                            data.address?.city || 
                            data.address?.town || 
                            data.address?.village || 
                            data.address?.state || 
                            data.display_name.split(',')[0]
        
        setTempLocation(prev => ({
          ...prev,
          name: locationName,
          fullAddress: data.display_name
        }))
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    } finally {
      setIsGeocodingLocation(false)
    }
  }

  const handleConfirm = () => {
    onLocationConfirm(tempLocation)
    onClose()
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          handleLocationSelect({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your current location. Please select manually on the map.')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  // ✅ Added: Click outside to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ✅ Enhanced: Modal with scroll lock and click-outside-to-close
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>Select Location</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Click anywhere on the map to select a location for your search
          </p>
        </div>

        {/* ✅ Fixed: Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Map */}
          <div className="h-96 relative">
            <MapContainer
              ref={mapRef}
              center={[tempLocation.lat, tempLocation.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              className="cursor-crosshair"
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationSelector 
                onLocationSelect={handleLocationSelect}
                selectedPosition={tempLocation}
              />
            </MapContainer>
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md z-10">
              <p className="text-sm text-gray-700 flex items-center space-x-2">
                <Crosshair className="w-4 h-4" />
                <span>Click on the map to select location</span>
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">Selected Location</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>Coordinates:</strong> {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> 
                    {isGeocodingLocation ? (
                      <span className="ml-1 text-primary-600">Loading...</span>
                    ) : (
                      <span className="ml-1">{tempLocation.name}</span>
                    )}
                  </p>
                  {tempLocation.fullAddress && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      {tempLocation.fullAddress}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleUseCurrentLocation}
                className="btn-secondary flex items-center space-x-2 ml-4 flex-shrink-0"
              >
                <Crosshair className="w-4 h-4" />
                <span className="hidden sm:inline">Use Current Location</span>
                <span className="sm:hidden">Current</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Fixed: Action Buttons - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn-primary flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker
